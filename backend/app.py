import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import Client, create_client

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL.rstrip("/"))


def create_supabase_client() -> Client | None:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        return None

    return create_client(supabase_url, supabase_key)


app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins
        }
    },
)

supabase = create_supabase_client()


def json_error(message: str, status_code: int = 400):
    response = jsonify({"error": message})
    response.status_code = status_code
    return response


def require_supabase_client() -> Client:
    if supabase is None:
        raise RuntimeError(
            "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY in backend/.env."
        )

    return supabase


def validate_plan_payload(payload: dict) -> dict:
    required_string_fields = {
        "email": "Email is required.",
        "full_name": "Full name is required.",
        "country": "Country is required.",
        "education_level": "Education level is required.",
        "main_goal": "Main goal is required.",
        "daily_time": "Daily time is required.",
        "learning_style": "Learning style is required.",
        "motivation_style": "Motivation style is required.",
        "recommendation": "Recommendation is required.",
    }

    cleaned_payload = {}

    for field_name, error_message in required_string_fields.items():
        field_value = payload.get(field_name)
        if not isinstance(field_value, str) or not field_value.strip():
            raise ValueError(error_message)
        cleaned_payload[field_name] = field_value.strip()

    growth_areas = payload.get("growth_areas")
    if not isinstance(growth_areas, list) or not growth_areas:
        raise ValueError("At least one growth area is required.")

    cleaned_growth_areas = []
    for area in growth_areas:
        if not isinstance(area, str) or not area.strip():
            raise ValueError("Growth areas must be a list of non-empty strings.")
        cleaned_growth_areas.append(area.strip())

    consent_given = payload.get("consent_given")
    if consent_given is not True:
        raise ValueError("Consent must be given before saving a growth plan.")

    cleaned_payload["email"] = cleaned_payload["email"].lower()
    cleaned_payload["growth_areas"] = cleaned_growth_areas
    cleaned_payload["consent_given"] = True

    return cleaned_payload


@app.errorhandler(ValueError)
def handle_value_error(error):
    return json_error(str(error), 400)


@app.errorhandler(RuntimeError)
def handle_runtime_error(error):
    return json_error(str(error), 500)


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    return json_error("An unexpected server error occurred. Please check your backend configuration and try again.", 500)


@app.get("/api/health")
def health_check():
    return jsonify(
        {
            "status": "ok",
            "message": "Brivio backend is running",
        }
    )


@app.get("/api/db-check")
def db_check():
    try:
        supabase_client = require_supabase_client()
        supabase_client.table("student_profiles").select("id").limit(1).execute()

        return jsonify(
            {
                "status": "ok",
                "message": "Supabase connection is working",
            }
        )
    except Exception:
        app.logger.exception("Supabase connection check failed.")
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Supabase connection failed. Check backend configuration.",
                }
            ),
            500,
        )


@app.post("/api/plans")
def save_plan():
    try:
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return json_error("A valid JSON request body is required.", 400)

        cleaned_payload = validate_plan_payload(payload)
        supabase_client = require_supabase_client()

        student_profile = {
            "email": cleaned_payload["email"],
            "full_name": cleaned_payload["full_name"],
            "country": cleaned_payload["country"],
            "education_level": cleaned_payload["education_level"],
            "main_goal": cleaned_payload["main_goal"],
        }

        supabase_client.table("student_profiles").upsert(
            student_profile,
            on_conflict="email",
        ).execute()

        student_lookup = (
            supabase_client.table("student_profiles")
            .select("id, email, full_name, country, education_level, main_goal, created_at, updated_at")
            .eq("email", cleaned_payload["email"])
            .single()
            .execute()
        )

        student_data = student_lookup.data
        if not student_data or not student_data.get("id"):
            raise RuntimeError("Student profile could not be saved correctly.")

        growth_plan = {
            "student_id": student_data["id"],
            "growth_areas": cleaned_payload["growth_areas"],
            "daily_time": cleaned_payload["daily_time"],
            "learning_style": cleaned_payload["learning_style"],
            "motivation_style": cleaned_payload["motivation_style"],
            "consent_given": cleaned_payload["consent_given"],
            "recommendation": cleaned_payload["recommendation"],
        }

        saved_plan_response = (
            supabase_client.table("growth_plans")
            .insert(growth_plan)
            .execute()
        )

        saved_plan_data = saved_plan_response.data[0] if saved_plan_response.data else growth_plan

        return (
            jsonify(
                {
                    "message": "Growth plan saved successfully.",
                    "profile": student_data,
                    "plan": saved_plan_data,
                }
            ),
            201,
        )
    except (ValueError, RuntimeError):
        raise
    except Exception:
        app.logger.exception("Failed to save growth plan.")
        return json_error("Unable to save growth plan. Please check backend configuration and try again.", 500)


@app.get("/api/plans")
def get_plans_by_email():
    try:
        email = request.args.get("email", "")
        normalized_email = email.strip().lower()

        if not normalized_email:
            return json_error("Email query parameter is required.", 400)

        supabase_client = require_supabase_client()

        student_lookup = (
            supabase_client.table("student_profiles")
            .select("id, email, full_name, country, education_level, main_goal, created_at, updated_at")
            .eq("email", normalized_email)
            .limit(1)
            .execute()
        )

        student_rows = student_lookup.data or []
        if not student_rows:
            return jsonify({"profile": {}, "plans": []})

        student_profile = student_rows[0]

        plans_lookup = (
            supabase_client.table("growth_plans")
            .select("id, student_id, growth_areas, daily_time, learning_style, motivation_style, consent_given, recommendation, created_at")
            .eq("student_id", student_profile["id"])
            .order("created_at", desc=True)
            .execute()
        )

        return jsonify(
            {
                "profile": student_profile,
                "plans": plans_lookup.data or [],
            }
        )
    except RuntimeError:
        raise
    except Exception:
        app.logger.exception("Failed to retrieve growth plans.")
        return json_error("Unable to retrieve growth plans. Please check backend configuration and try again.", 500)


if __name__ == "__main__":
    app.run(debug=True, port=5000)