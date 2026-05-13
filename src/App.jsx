import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'brivio-mvp-session'

const countries = [
  'Bangladesh',
  'India',
  'Pakistan',
  'Nepal',
  'Sri Lanka',
  'Bhutan',
  'Maldives',
  'Afghanistan',
]

const educationLevels = ['School', 'College', 'Undergraduate', 'Postgraduate']

const mainGoals = [
  'Improve grades',
  'Build confidence',
  'Improve vocabulary',
  'Learn future skills',
  'Reduce study stress',
  'Explore creativity',
]

const dailyTimeOptions = ['10 minutes', '20 minutes', '30 minutes', '45 minutes']
const learningStyles = ['Games', 'Short lessons', 'Challenges', 'Reflection activities', 'Mixed']
const motivationStyles = ['Calm', 'Competitive', 'Friendly', 'Mentor-like']

const growthAreas = [
  {
    id: 'Study Focus',
    emoji: '📚',
    description: 'Build better routines and concentration.',
    activity: '10-minute focus sprint',
    accent: 'blue',
  },
  {
    id: 'IQ & Problem Solving',
    emoji: '🧠',
    description: 'Improve logic, puzzles, and critical thinking.',
    activity: 'Logic puzzle warm-up',
    accent: 'sky',
  },
  {
    id: 'Vocabulary Builder',
    emoji: '🗣️',
    description: 'Learn new words and improve communication.',
    activity: '5 new words challenge',
    accent: 'yellow',
  },
  {
    id: 'Creativity Boost',
    emoji: '💡',
    description: 'Explore imagination, ideas, and storytelling.',
    activity: 'Story idea challenge',
    accent: 'blue',
  },
  {
    id: 'Mindfulness & Balance',
    emoji: '🌿',
    description: 'Reduce stress and improve emotional balance.',
    activity: 'Evening reflection journal',
    accent: 'sky',
  },
  {
    id: 'Future Skills',
    emoji: '🚀',
    description: 'Learn digital, AI, and practical life skills.',
    activity: 'AI tool discovery task',
    accent: 'yellow',
  },
]

const defaultFormState = {
  email: '',
  password: '',
  fullName: '',
  country: '',
  educationLevel: '',
  mainGoal: '',
  selectedGrowthAreas: [],
  preferredDailyTime: '',
  learningStyle: '',
  motivationStyle: '',
  consent: false,
}

const stepLabels = {
  details: 1,
  growth: 2,
  preferences: 3,
  confirmation: 4,
}

const heroChips = ['Focus Better', 'Learn Smarter', 'Grow Confidently']

function loadStoredState() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function App() {
  const storedState = loadStoredState()
  const [currentPage, setCurrentPage] = useState(storedState?.currentPage || 'login')
  const [returnPage, setReturnPage] = useState('login')
  const [formData, setFormData] = useState(storedState?.formData || defaultFormState)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ currentPage, formData }))
  }, [currentPage, formData])

  const currentStep = stepLabels[currentPage] || 0
  const recommendation = useMemo(() => buildRecommendation(formData), [formData])
  const activities = useMemo(() => getRecommendedActivities(formData.selectedGrowthAreas), [formData.selectedGrowthAreas])

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: '' }))
  }

  const navigateTo = (page) => {
    setCurrentPage(page)
    setErrors({})
  }

  const goBack = () => {
    if (currentPage === 'details') navigateTo('login')
    if (currentPage === 'growth') navigateTo('details')
    if (currentPage === 'preferences') navigateTo('growth')
    if (currentPage === 'confirmation') navigateTo('preferences')
    if (currentPage === 'unsuccessful') navigateTo('preferences')
  }

  const resetApp = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setFormData(defaultFormState)
    setErrors({})
    setReturnPage('login')
    setCurrentPage('login')
  }

  const openEthics = () => {
    setReturnPage(currentPage)
    navigateTo('ethics')
  }

  const closeEthics = () => {
    navigateTo(returnPage || 'login')
  }

  const handleLogin = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!formData.email.trim()) {
      nextErrors.email = 'Please enter your email so Brivio can begin your journey.'
    }

    if (!formData.password.trim()) {
      nextErrors.password = 'Please enter your password to continue.'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    navigateTo('details')
  }

  const handleDetails = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!formData.fullName.trim()) nextErrors.fullName = 'Please share your full name for your personalised plan.'
    if (!formData.country) nextErrors.country = 'Please choose your country.'
    if (!formData.educationLevel) nextErrors.educationLevel = 'Please choose your education level.'
    if (!formData.mainGoal) nextErrors.mainGoal = 'Please select your main growth goal.'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    navigateTo('growth')
  }

  const toggleGrowthArea = (areaId) => {
    setFormData((previous) => {
      const isSelected = previous.selectedGrowthAreas.includes(areaId)
      return {
        ...previous,
        selectedGrowthAreas: isSelected
          ? previous.selectedGrowthAreas.filter((item) => item !== areaId)
          : [...previous.selectedGrowthAreas, areaId],
      }
    })
    setErrors((previous) => ({ ...previous, selectedGrowthAreas: '' }))
  }

  const handleGrowth = () => {
    if (formData.selectedGrowthAreas.length < 2) {
      setErrors({
        selectedGrowthAreas:
          'Please choose at least two growth areas so Brivio can create a balanced recommendation.',
      })
      return
    }

    navigateTo('preferences')
  }

  const handlePreferences = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!formData.preferredDailyTime) nextErrors.preferredDailyTime = 'Please select your preferred daily time.'
    if (!formData.learningStyle) nextErrors.learningStyle = 'Please choose how you learn best.'
    if (!formData.motivationStyle) nextErrors.motivationStyle = 'Please choose your motivation style.'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    if (!formData.consent) {
      navigateTo('unsuccessful')
      return
    }

    navigateTo('confirmation')
  }

  return (
    <div className="app-shell">
      {currentPage !== 'login' && currentPage !== 'ethics' && (
        <Header currentStep={currentStep} onBack={goBack} showBack={currentPage !== 'confirmation'} />
      )}

      {currentPage === 'login' && (
        <LoginPage
          formData={formData}
          errors={errors}
          onChange={updateField}
          onSubmit={handleLogin}
          onOpenEthics={openEthics}
        />
      )}

      {currentPage === 'details' && (
        <StudentDetailsPage formData={formData} errors={errors} onChange={updateField} onSubmit={handleDetails} />
      )}

      {currentPage === 'growth' && (
        <GrowthSelectionPage
          selectedGrowthAreas={formData.selectedGrowthAreas}
          error={errors.selectedGrowthAreas}
          onToggle={toggleGrowthArea}
          onBack={goBack}
          onContinue={handleGrowth}
        />
      )}

      {currentPage === 'preferences' && (
        <PreferencesPage
          formData={formData}
          errors={errors}
          onChange={updateField}
          onSubmit={handlePreferences}
          onBack={goBack}
        />
      )}

      {currentPage === 'confirmation' && (
        <ConfirmationPage
          formData={formData}
          recommendation={recommendation}
          activities={activities}
          onStartAgain={resetApp}
          onOpenEthics={openEthics}
        />
      )}

      {currentPage === 'unsuccessful' && <UnsuccessfulPage onBack={goBack} onStartAgain={resetApp} />}

      {currentPage === 'ethics' && <EthicsPage onBack={closeEthics} isHome={returnPage === 'login'} />}
    </div>
  )
}

function Header({ currentStep, onBack, showBack }) {
  return (
    <header className="app-header surface-card">
      <div className="brand-inline">
        <img src="/brivio-logo.png" alt="Brivio logo" className="header-logo" />
        <div>
          <p className="eyebrow">Brivio</p>
          <h2>Learn • Grow • Thrive</h2>
        </div>
      </div>

      <div className="header-right">
        <ProgressBar currentStep={currentStep} totalSteps={4} />
        {showBack && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
      </div>
    </header>
  )
}

function ProgressBar({ currentStep, totalSteps }) {
  const percentage = `${(currentStep / totalSteps) * 100}%`

  return (
    <div className="progress-box" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      <div className="progress-meta">
        <div className="progress-copy">Step {currentStep} of {totalSteps}</div>
        <div className="progress-mini-dots" aria-hidden="true">
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={index + 1}
              className={`progress-dot ${index + 1 <= currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: percentage }} />
      </div>
    </div>
  )
}

function LoginPage({ formData, errors, onChange, onSubmit, onOpenEthics }) {
  return (
    <main className="page login-page">
      <section className="login-layout">
        <div className="login-panel login-copy-panel">
          <img src="/brivio-logo.png" alt="Brivio logo" className="hero-logo" />
          <p className="eyebrow">Welcome to Brivio</p>
          <h1>Learn • Grow • Thrive</h1>
          <p className="subheadline">A smart growth platform for students.</p>
          <p className="lead-text">
            Brivio helps students improve focus, vocabulary, confidence, wellbeing, and future skills through a
            simple personalised journey.
          </p>

          <div className="chip-row">
            {heroChips.map((chip) => (
              <span key={chip} className="feature-chip">{chip}</span>
            ))}
          </div>

          <article className="trust-card">
            <h3>Why Brivio?</h3>
            <ul className="trust-list">
              <li>Personalised growth steps</li>
              <li>Student-friendly journey</li>
              <li>No permanent data storage in this MVP</li>
            </ul>
          </article>
        </div>

        <div className="login-panel form-panel">
          <form className="form-card login-card" onSubmit={onSubmit} noValidate>
            <div className="form-intro-row">
              <div>
                <h3>Log in to Brivio</h3>
                <p>Start your personalised growth journey.</p>
              </div>
            </div>

            <div className="login-fields">
              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                error={errors.email}
                onChange={(event) => onChange('email', event.target.value)}
              />
              <InputField
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                error={errors.password}
                onChange={(event) => onChange('password', event.target.value)}
              />
            </div>

            <Button type="submit" className="login-button">Login</Button>

            <div className="form-footer-row login-footer">
              <p className="micro-note">This MVP does not permanently store your data.</p>
              <button type="button" className="text-link" onClick={onOpenEthics}>
                Ethics & Privacy
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

function StudentDetailsPage({ formData, errors, onChange, onSubmit }) {
  return (
    <main className="page">
      <section className="content-card surface-card narrow-card">
        <PageIntro
          step="Step 1"
          title="Student Details"
          description="Tell Brivio who you are so we can personalise a temporary growth plan."
        />
        <div className="info-banner">Brivio only asks for the basics needed for a temporary recommendation.</div>
        <form className="form-grid" onSubmit={onSubmit} noValidate>
          <InputField
            id="fullName"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            error={errors.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
          />
          <SelectField
            id="country"
            label="Country"
            value={formData.country}
            error={errors.country}
            options={countries}
            placeholder="Select a country"
            onChange={(event) => onChange('country', event.target.value)}
          />
          <SelectField
            id="educationLevel"
            label="Education Level"
            value={formData.educationLevel}
            error={errors.educationLevel}
            options={educationLevels}
            placeholder="Select your education level"
            onChange={(event) => onChange('educationLevel', event.target.value)}
          />
          <SelectField
            id="mainGoal"
            label="Main Goal"
            value={formData.mainGoal}
            error={errors.mainGoal}
            options={mainGoals}
            placeholder="Choose your main goal"
            onChange={(event) => onChange('mainGoal', event.target.value)}
          />
          <div className="form-actions full-span align-end">
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </section>
    </main>
  )
}

function GrowthSelectionPage({ selectedGrowthAreas, error, onToggle, onBack, onContinue }) {
  return (
    <main className="page">
      <section className="content-card surface-card">
        <PageIntro
          step="Step 2"
          title="Choose Your Growth Areas"
          description="Pick at least two areas you want to improve."
        />
        <div className="growth-grid">
          {growthAreas.map((area) => (
            <GrowthCard
              key={area.id}
              area={area}
              isSelected={selectedGrowthAreas.includes(area.id)}
              onClick={() => onToggle(area.id)}
            />
          ))}
        </div>
        {error && <p className="error-text centered-error">{error}</p>}
        <div className="form-actions split-actions top-space">
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button onClick={onContinue}>Continue</Button>
        </div>
      </section>
    </main>
  )
}

function PreferencesPage({ formData, errors, onChange, onSubmit, onBack }) {
  return (
    <main className="page">
      <section className="content-card surface-card narrow-card">
        <PageIntro
          step="Step 3"
          title="Learning Preferences"
          description="Choose how Brivio should shape your daily growth routine."
        />
        <form className="form-grid" onSubmit={onSubmit} noValidate>
          <SelectField
            id="preferredDailyTime"
            label="Preferred Daily Time"
            value={formData.preferredDailyTime}
            error={errors.preferredDailyTime}
            options={dailyTimeOptions}
            placeholder="Choose a time"
            onChange={(event) => onChange('preferredDailyTime', event.target.value)}
          />
          <SelectField
            id="learningStyle"
            label="Learning Style"
            value={formData.learningStyle}
            error={errors.learningStyle}
            options={learningStyles}
            placeholder="Choose a learning style"
            onChange={(event) => onChange('learningStyle', event.target.value)}
          />
          <SelectField
            id="motivationStyle"
            label="Motivation Style"
            value={formData.motivationStyle}
            error={errors.motivationStyle}
            options={motivationStyles}
            placeholder="Choose a motivation style"
            onChange={(event) => onChange('motivationStyle', event.target.value)}
          />
          <label className="consent-box full-span">
            <input type="checkbox" checked={formData.consent} onChange={(event) => onChange('consent', event.target.checked)} />
            <span>
              I understand that Brivio uses my inputs only to generate a temporary personalised recommendation and does not permanently store my data.
            </span>
          </label>
          <div className="form-actions split-actions full-span top-space">
            <Button variant="secondary" type="button" onClick={onBack}>Back</Button>
            <Button type="submit">Generate My Growth Plan</Button>
          </div>
        </form>
      </section>
    </main>
  )
}

function ConfirmationPage({ formData, recommendation, activities, onStartAgain, onOpenEthics }) {
  return (
    <main className="page">
      <section className="content-card surface-card">
        <PageIntro
          step="Step 4"
          title="Your Brivio Growth Plan is Ready"
          description="Your recommendation is organised into a clear and simple summary."
        />
        <div className="summary-layout">
          <article className="summary-card info-card">
            <h2>Your Summary</h2>
            <SummaryRow label="Student name" value={formData.fullName} />
            <SummaryRow label="Country" value={formData.country} />
            <SummaryRow label="Education level" value={formData.educationLevel} />
            <SummaryRow label="Main goal" value={formData.mainGoal} />
            <SummaryRow label="Selected growth areas" value={formData.selectedGrowthAreas.join(', ')} />
            <SummaryRow label="Preferred daily time" value={formData.preferredDailyTime} />
            <SummaryRow label="Learning style" value={formData.learningStyle} />
            <SummaryRow label="Motivation style" value={formData.motivationStyle} />
          </article>
          <article className="recommendation-card info-card success-card">
            <span className="section-badge">Personalised recommendation</span>
            <h2>What Brivio suggests next</h2>
            <p>{recommendation}</p>
          </article>
        </div>

        <section className="activity-section">
          <div className="section-header-inline">
            <div>
              <h2>Recommended Activities</h2>
              <p className="section-intro compact-intro">A clean starting point for your next learning steps.</p>
            </div>
          </div>
          <div className="activity-grid">
            {activities.map((activity) => (
              <article key={activity.title} className={`activity-card info-card accent-${activity.accent}`}>
                <div className="activity-emoji">{activity.emoji}</div>
                <h3>{activity.title}</h3>
                <p>Inspired by your interest in {activity.area.toLowerCase()}.</p>
              </article>
            ))}
          </div>
        </section>

        <div className="form-actions split-actions top-space">
          <Button variant="secondary" onClick={onStartAgain}>Start Again</Button>
          <Button onClick={onOpenEthics}>View Ethics & Privacy</Button>
        </div>
      </section>
    </main>
  )
}

function UnsuccessfulPage({ onBack, onStartAgain }) {
  return (
    <main className="page">
      <section className="content-card surface-card narrow-card status-card">
        <div className="status-hero">!</div>
        <PageIntro
          step="Review needed"
          title="Growth Plan Could Not Be Created"
          description="Brivio needs complete information and consent before creating a personalised growth plan."
        />
        <div className="form-actions split-actions top-space">
          <Button onClick={onBack}>Go Back to Preferences</Button>
          <Button variant="secondary" onClick={onStartAgain}>Start Again</Button>
        </div>
      </section>
    </main>
  )
}

function EthicsPage({ onBack, isHome }) {
  const ethicsItems = [
    { title: 'Data Minimisation', description: 'Brivio only asks for information needed to create a basic temporary growth recommendation.' },
    { title: 'Consent', description: 'Users must give consent before a growth plan is generated.' },
    { title: 'Transparency', description: 'The app explains how information is used in this MVP.' },
    { title: 'Temporary Data Use', description: 'This MVP does not use a database and does not permanently store personal data.' },
    { title: 'User Control', description: 'Users can restart the app and clear temporary information at any time.' },
    { title: 'Student Wellbeing', description: 'Brivio focuses on confidence, balance, and positive growth.' },
  ]

  return (
    <main className="page ethics-page">
      <section className="content-card surface-card">
        <PageIntro
          step="Ethics & Privacy"
          title="Built with trust and wellbeing in mind"
          description="Brivio is designed as a transparent MVP that demonstrates responsible student data collection and supportive growth design."
        />
        <div className="ethics-grid">
          {ethicsItems.map((item) => (
            <article key={item.title} className="ethics-card info-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
        <div className="form-actions top-space">
          <Button onClick={onBack}>{isHome ? 'Back to Home' : 'Back to Previous Step'}</Button>
        </div>
      </section>
    </main>
  )
}

function PageIntro({ step, title, description }) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{step}</p>
      <h1>{title}</h1>
      <p className="section-intro">{description}</p>
    </div>
  )
}

function Button({ children, variant = 'primary', type = 'button', onClick, className = '' }) {
  return <button type={type} className={`button button-${variant} ${className}`.trim()} onClick={onClick}>{children}</button>
}

function InputField({ id, label, error, ...props }) {
  return (
    <label className="field-group" htmlFor={id}>
      <span className="field-label">{label}</span>
      <input id={id} className={`input-control ${error ? 'input-error' : ''}`} {...props} />
      {error && <small className="error-text">{error}</small>}
    </label>
  )
}

function SelectField({ id, label, options, placeholder, error, ...props }) {
  return (
    <label className="field-group" htmlFor={id}>
      <span className="field-label">{label}</span>
      <select id={id} className={`input-control ${error ? 'input-error' : ''}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error && <small className="error-text">{error}</small>}
    </label>
  )
}

function GrowthCard({ area, isSelected, onClick }) {
  return (
    <button type="button" className={`growth-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className={`growth-icon accent-${area.accent}`}>{area.emoji}</div>
      <div>
        <h3>{area.id}</h3>
        <p>{area.description}</p>
      </div>
      <span className="selection-badge">{isSelected ? 'Selected' : 'Select area'}</span>
    </button>
  )
}

function SummaryRow({ label, value }) {
  return <div className="summary-row"><span>{label}</span><strong>{value}</strong></div>
}

function buildRecommendation(formData) {
  const areaText = formData.selectedGrowthAreas.join(', ').replace(/,([^,]*)$/, ' and$1')
  return `Based on your selected goal to ${formData.mainGoal.toLowerCase()}, Brivio recommends a ${formData.preferredDailyTime.toLowerCase()} daily routine using ${formData.learningStyle.toLowerCase()} activities and a ${formData.motivationStyle.toLowerCase()} tone. This plan blends ${areaText.toLowerCase()} to help you grow beyond grades while building confidence, balance, and future-ready habits.`
}

function getRecommendedActivities(selectedAreas) {
  const chosen = growthAreas.filter((area) => selectedAreas.includes(area.id))
  const fallback = growthAreas.filter((area) => !selectedAreas.includes(area.id))
  return [...chosen, ...fallback].slice(0, 3).map((area) => ({ title: area.activity, emoji: area.emoji, accent: area.accent, area: area.id }))
}

export default App