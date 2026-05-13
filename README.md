# Brivio

**Tagline:** Learn • Grow • Thrive

Brivio is a colourful, child-friendly EdTech MVP built for South Asian learners. Unlike traditional platforms that focus only on grades and exams, Brivio demonstrates how an app can support whole-student growth through study focus, confidence, creativity, vocabulary, mindfulness, problem-solving, and future skills.

## Problem Statement
Many EdTech products are heavily exam-focused and overlook student wellbeing, confidence, creativity, and future-ready growth. Brivio addresses this gap by showing how a student-friendly platform can personalise a broader development journey while using ethical, minimal data collection.

## Target Users
- School, college, and university students in South Asia
- Students who want support beyond grades
- Learners who want a fun but trustworthy growth experience
- Demonstration audiences such as lecturers, tutors, and startup evaluators

## Features
- Login screen with Brivio branding and ethical note
- Multi-step onboarding flow
- Student details collection
- Growth area selection with interactive cards
- Learning preference selection
- Consent-aware plan generation
- Successful confirmation screen with dynamic recommendations
- Unsuccessful screen when consent is missing
- Ethics & Privacy page explaining responsible design choices
- Temporary demo persistence using `sessionStorage`
- Responsive premium UI built for presentation/demo quality

## App Flow
1. **Login Page**  
   User enters email and password and can review the Ethics & Privacy page.
2. **Student Details Page**  
   User provides name, country, education level, and main goal.
3. **Growth Selection Page**  
   User selects at least two growth areas.
4. **Preferences Page**  
   User selects daily time, learning style, motivation style, and gives consent.
5. **Confirmation Page**  
   Brivio shows a personalised growth plan summary and recommended activities.
6. **Unsuccessful Page**  
   If consent is not given, the app explains why the plan could not be generated.
7. **Ethics & Privacy Page**  
   Available from the flow to clearly explain data use and user wellbeing choices.

## Ethical Considerations
- **Data minimisation:** only basic information is collected for demo personalisation.
- **Consent:** plan generation requires explicit user consent.
- **Transparency:** the app explains how student inputs are used.
- **Temporary data use:** no backend or database is used; data is stored only in `sessionStorage` for demonstration.
- **User control:** users can restart the experience and clear temporary information.
- **Student wellbeing:** the experience focuses on encouragement, balance, and positive growth rather than harmful pressure.

## Technologies Used
- React
- Vite
- JavaScript
- CSS

## How to Run
```powershell
npm install
npm run dev
```

## MVP Note
This project is an MVP for a university assignment. It does not use a backend, database, real authentication, or external APIs. It is designed to demonstrate the core user journey, UI/UX quality, ethical awareness, and startup product thinking.

## Important Asset Note
Place the provided logo file at:

```text
public/brivio-logo.png
```

The app is already wired to use that logo on the login screen and in the header across the app.
