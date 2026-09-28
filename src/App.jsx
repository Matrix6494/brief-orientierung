import { useCallback, useEffect, useMemo, useState } from 'react'
import StartScreen from './screens/StartScreen'
import CaptureScreen from './screens/CaptureScreen'
import RecognitionScreen from './screens/RecognitionScreen'
import ActionPathScreen from './screens/ActionPathScreen'
import ExplainPathScreen from './screens/ExplainPathScreen'
import FallbackScreen from './screens/FallbackScreen'
import { addDays, DEADLINE_DAYS, loadDeadlineFromStorage } from './utils/dates'

const SCREENS = {
  START: 'start',
  CAPTURE: 'capture',
  RECOGNITION: 'recognition',
  ACTIONS: 'actions',
  EXPLAIN: 'explain',
  FALLBACK: 'fallback',
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.START)
  const [history, setHistory] = useState([SCREENS.START])
  const [photoPreview, setPhotoPreview] = useState(null)
  const [receiptDate, setReceiptDate] = useState(null)

  useEffect(() => {
    const stored = loadDeadlineFromStorage()
    if (stored?.receiptDate) {
      setReceiptDate(stored.receiptDate)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    const root = document.getElementById('root')
    if (root) root.scrollTop = 0
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      const main = document.querySelector('main')
      if (main) {
        main.setAttribute('tabindex', '-1')
        main.focus({ preventScroll: true })
      }
    })
  }, [screen])

  const deadlineEnd = useMemo(
    () => (receiptDate ? addDays(receiptDate, DEADLINE_DAYS) : null),
    [receiptDate],
  )

  const navigate = useCallback((next) => {
    setScreen(next)
    setHistory((prev) => [...prev, next])
  }, [])

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.slice(0, -1)
      setScreen(next[next.length - 1])
      return next
    })
  }, [])

  const handlePhotoSelected = useCallback(
    (previewUrl) => {
      setPhotoPreview((old) => {
        if (old) URL.revokeObjectURL(old)
        return previewUrl
      })
      navigate(SCREENS.RECOGNITION)
    },
    [navigate],
  )

  const handleTypeSelected = useCallback(
    (typeId) => {
      if (typeId === 'mietzinserhohung') {
        navigate(SCREENS.RECOGNITION)
      } else {
        navigate(SCREENS.FALLBACK)
      }
    },
    [navigate],
  )

  switch (screen) {
    case SCREENS.START:
      return (
        <StartScreen
          onUpload={() => navigate(SCREENS.CAPTURE)}
          onChooseType={() => navigate(SCREENS.CAPTURE)}
        />
      )

    case SCREENS.CAPTURE:
      return (
        <CaptureScreen
          onBack={goBack}
          onPhotoSelected={handlePhotoSelected}
          onTypeSelected={handleTypeSelected}
        />
      )

    case SCREENS.RECOGNITION:
      return (
        <RecognitionScreen
          photoPreview={photoPreview}
          receiptDate={receiptDate}
          deadlineEnd={deadlineEnd}
          onBack={goBack}
          onReceiptDateChange={setReceiptDate}
          onGoActions={() => navigate(SCREENS.ACTIONS)}
          onGoExplain={() => navigate(SCREENS.EXPLAIN)}
        />
      )

    case SCREENS.ACTIONS:
      return (
        <ActionPathScreen
          deadlineEnd={deadlineEnd}
          receiptDate={receiptDate}
          onBack={goBack}
          onGoExplain={() => navigate(SCREENS.EXPLAIN)}
        />
      )

    case SCREENS.EXPLAIN:
      return (
        <ExplainPathScreen
          deadlineEnd={deadlineEnd}
          receiptDate={receiptDate}
          onBack={goBack}
          onGoActions={() => navigate(SCREENS.ACTIONS)}
        />
      )

    case SCREENS.FALLBACK:
      return <FallbackScreen onBack={goBack} />

    default:
      return null
  }
}
