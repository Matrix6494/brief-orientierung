(function () {
  'use strict'

  const STORAGE_KEY = 'brief-orientierung-deadline'
  const DEADLINE_DAYS = 30
  const REFERENCE_LETTER_SRC = 'reference-letter.svg'
  const DEMO_LETTER_SRC = 'demo-letter.jpg'
  const SCAN_MS = 1800

  /**
   * Zone coordinates as % of the cropped A4 letter (top, left, width, height).
   * Layout matches a typical official Lucerne rent-increase form:
   * 1 sender = upper fifth, left half.
   */
  const LETTER_SECTIONS = [
    {
      id: 'sender',
      title: 'Sender and date',
      mustBe: 'Who sends the letter (landlord or property management) and the date of the letter.',
      watchOut: 'Write down the day you received it. Your 30-day deadline starts on that day, not on the date printed on the letter. Keep the envelope.',
      zone: { top: 15, left: 0, width: 50, height: 8.7 },
    },
    {
      id: 'form',
      title: 'Official form',
      mustBe: 'The letter must be the official form approved by the canton (title similar to "Mitteilung von Mietzinserhöhungen").',
      watchOut: 'A normal letter or an email is not enough. Without the official form, the increase is not valid.',
      zone: { top: 0, left: 50, width: 50, height: 8 },
    },
    {
      id: 'rent',
      title: 'Old rent and new rent',
      mustBe: 'Your current rent and your new rent, each with the additional costs (Nebenkosten) listed separately.',
      watchOut: 'Compare the old rent with your contract or your last payment. Calculate how much more you pay per month and per year.',
      zone: { top: 33.3, left: 0, width: 100, height: 24.2 },
    },
    {
      id: 'reason',
      title: 'Reason given',
      mustBe: 'Why the rent goes up. If there are several reasons, the amount for each reason must be listed.',
      watchOut: 'The reason must be clear. Common reasons are a change in the reference interest rate, inflation, higher costs or renovations. If the reason is vague or you cannot follow the calculation, you can ask the landlord to explain it, or have it checked for free.',
      zone: { top: 57.5, left: 0, width: 100, height: 10 },
    },
    {
      id: 'effective',
      title: 'Effective from',
      mustBe: 'The date from which the new rent applies.',
      watchOut: 'The increase can only start on a date when your contract could be terminated. The form must reach you at least 10 days before the notice period starts. Check your contract for these dates.',
      zone: { top: 81.3, left: 0, width: 100, height: 6.2 },
    },
    {
      id: 'contest',
      title: 'Right to contest',
      mustBe: 'How and where you can contest the increase, with the list of conciliation authorities (Schlichtungsbehörden) and their addresses.',
      watchOut: 'You have 30 days from receipt. Contesting is free, and a short letter with one sentence is enough. Your landlord may not end your lease because you contested.',
      zone: { top: 85.9, left: 0, width: 100, height: 4.9 },
    },
    {
      id: 'signature',
      title: 'Signature',
      mustBe: 'The form is signed by the landlord or property management.',
      watchOut: 'If the increase is combined with a threat to end your lease, it is not valid.',
      zone: { top: 88.3, left: 48, width: 52, height: 7 },
    },
  ]

  const SCREENS = {
    START: 'start',
    CAPTURE: 'capture',
    SCANNING: 'scanning',
    COST: 'cost',
    CHECK: 'check',
    CHECK_RESULT: 'check-result',
    LETTER: 'letter',
    TOUR: 'tour',
    SUMMARY: 'summary',
    ACTIONS: 'actions',
    FALLBACK: 'fallback',
  }

  const CHECK_QUESTIONS = [
    {
      key: 'lastChange',
      options: [
        { value: 'lt1', label: 'Less than 1 year ago' },
        { value: '1to3', label: '1–3 years ago' },
        { value: 'gt3', label: 'More than 3 years ago' },
        { value: 'unknown', label: 'I don\'t know' },
      ],
    },
    {
      key: 'reason',
      options: [
        { value: 'clear', label: 'Yes, clearly' },
        { value: 'vague', label: 'Only vaguely (e.g. "rising costs")' },
        { value: 'no', label: 'No' },
        { value: 'unsure', label: 'I\'m not sure' },
      ],
    },
    {
      key: 'lowered',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unknown', label: 'I don\'t know' },
      ],
    },
  ]

  const COPY = {
    clear: {
      startLead: 'An official letter can feel unsettling. That is understandable.',
      startTitle: 'We help you understand it.',
      startSub: 'In plain language. Section by section. No legal jargon.',
      howTitle: 'How it works',
      step1Title: 'Show your letter',
      step1Text: 'Take a photo inside the frame.',
      step2Title: 'Walk through sections',
      step2Text: 'We guide you through each part of the form.',
      step3Title: 'Next step',
      step3Text: 'You see what you can do.',
      takesTime: 'Takes about 3 minutes.',
      getStarted: 'Get started',
      startHint: 'Take a photo or choose a letter type',
      chooseType: 'Choose letter type instead',
      captureTitle: 'Photograph your letter',
      captureLead: 'Place the whole letter inside the frame. You can also upload a photo from your gallery.',
      cameraHint: 'Place the whole letter inside the frame',
      takePhoto: 'Take photo',
      uploadGallery: 'Upload from gallery',
      orDivider: 'or',
      letterTypeHeading: 'What kind of letter did you receive?',
      continueExample: 'Continue with example form (no photo)',
      scanTitle: 'Scanning your letter…',
      scanSub: 'Finding the sections on your form',
      costHeadline: 'This increase costs you CHF {yearly} per year.',
      costSub: 'That\'s CHF {monthly} more every month.',
      countdown: 'You have until {date} to check it. {days} days left.',
      countdownDays: 'You have {days} days left to check it.',
      countdownOverdue: 'The 30-day deadline has passed.',
      receiptLabel: 'When did you get the letter?',
      q1: 'When did your rent last change before this?',
      q2: 'Does the letter say why the rent goes up?',
      q3: 'Has your landlord ever lowered your rent?',
      resultYellowTitle: 'Probably fine',
      resultYellowText: 'Probably fine, but a free check costs nothing.',
      resultOrangeTitle: 'Worth checking',
      resultOrangeText: 'Worth checking. Many increases are not fully justified.',
      letterIntro: 'We filled in everything we know. You only sign and send it.',
      costCta: 'Is this allowed? Check in 3 questions',
      costSkip: 'Walk through the letter instead',
      resultLetterCta: 'Prepare my letter',
      resultTourCta: 'Walk through the letter first',
      letterTitle: 'Your letter is ready',
    },
    friendly: {
      startLead: 'A letter like this can sit in your stomach. That\'s normal.',
      startTitle: 'We\'ll go through it together.',
      startSub: 'Plain words. One bit at a time. No lawyer-speak.',
      howTitle: 'What we do',
      step1Title: 'Show the letter',
      step1Text: 'Snap it in the frame – that\'s it.',
      step2Title: 'We walk you through it',
      step2Text: 'Each part of the form, in normal words.',
      step3Title: 'You see what\'s next',
      step3Text: 'What you can do, without the panic.',
      takesTime: 'About 3 minutes. Promise.',
      getStarted: 'Let\'s go',
      startHint: 'A photo or a letter type – whatever is easier.',
      chooseType: 'I\'d rather pick a letter type',
      captureTitle: 'Show us the letter',
      captureLead: 'Get the whole page in the frame. A photo from your gallery is fine too.',
      cameraHint: 'Whole letter in the frame, please',
      takePhoto: 'Take a photo',
      uploadGallery: 'Pick one from the gallery',
      orDivider: 'or',
      letterTypeHeading: 'What kind of letter showed up?',
      continueExample: 'Skip the photo – use the example form',
      scanTitle: 'Having a look…',
      scanSub: 'Finding the bits that matter',
      costHeadline: 'Ouch – that\'s CHF {yearly} a year. Let\'s see if that\'s even allowed.',
      costSub: 'That\'s CHF {monthly} extra every month.',
      countdown: '{days} days left until {date}. Plenty of time, but don\'t put it in the drawer.',
      countdownDays: '{days} days left. Plenty of time, but don\'t put it in the drawer.',
      countdownOverdue: 'The deadline has passed – still worth asking for a free check.',
      receiptLabel: 'When did this letter land in your letterbox?',
      q1: 'When did your rent last go up or down?',
      q2: 'Does the letter actually explain why they want more money?',
      q3: 'Did your landlord ever put the rent down, not just up?',
      resultYellowTitle: 'Looks okay-ish',
      resultYellowText: 'Looks okay-ish — still, a free check never hurts.',
      resultOrangeTitle: 'Worth a look',
      resultOrangeText: 'Worth a look. A lot of these increases don\'t fully add up.',
      letterIntro: 'We wrote the boring bit. You sign, send it, and that\'s the hard part done.',
      costCta: 'Is this even allowed? Three quick questions',
      costSkip: 'Or walk through the letter first',
      resultLetterCta: 'Prepare my letter',
      resultTourCta: 'Walk through the letter first',
      letterTitle: 'Your letter is ready',
    },
  }

  const LETTER_TYPES = [
    { id: 'mietzinserhohung', label: 'Rent increase' },
    { id: 'kuendigung', label: 'Eviction notice' },
    { id: 'betreibung', label: 'Debt collection' },
    { id: 'versicherung', label: 'Insurance claim denied' },
    { id: 'anderes', label: 'Other' },
  ]

  const ACTION_STEPS = [
    { n: 1, title: 'Get it reviewed', text: 'A rent increase must be justified. General reasons like rising costs alone are often not enough.' },
    { n: 2, title: 'Watch the deadline', text: 'You have 30 days from receipt to contest the increase. It costs nothing.' },
    { n: 3, title: 'Get help', text: 'Contact the tenancy mediation authority in Canton Lucerne.' },
  ]

  const CONTACTS = [
    {
      role: 'authority',
      tag: 'Send your letter here',
      name: 'Schlichtungsbehörde Miete und Pacht',
      subtitle: 'Tenancy conciliation authority · Canton of Lucerne',
      address: 'Bahnhofstrasse 22, 6002 Lucerne',
      phoneLabel: 'Advice by phone',
      phone: '041 228 63 66',
      phoneHref: 'tel:0412286366',
      phoneNote: 'Tuesday and Thursday, 2–5 pm',
      email: 'sb.miete+pacht@lu.ch',
      link: 'https://gerichte.lu.ch/organisation/schlichtungsbehoerden/miete_pacht',
      linkLabel: 'gerichte.lu.ch',
    },
    {
      role: 'advice',
      tag: 'Advice only',
      name: 'Tenants\' Association (Mieterverband)',
      subtitle: 'Can advise you, but is not the authority for the contestation',
      address: 'Industriestrasse 11, 6005 Lucerne',
      phoneLabel: 'Phone',
      phone: '041 220 10 22',
      phoneHref: 'tel:0412201022',
      email: 'luzern@mieterverband.ch',
      link: 'https://www.mieterverband.ch/mietrecht/waehrend-der-miete/mietzinserhohung/',
      linkLabel: 'mieterverband.ch – Rent increases',
    },
  ]

  const AUTHORITY = CONTACTS[0]

  const state = {
    screen: SCREENS.START,
    history: [SCREENS.START],
    croppedPhotoUrl: null,
    useReferenceImage: false,
    tourIndex: 0,
    receiptDate: null,
    savedHint: false,
    scrollAfterRender: true,
    scanTimer: null,
    cameraStream: null,
    focusActiveHotspot: false,
    tone: 'clear',
    oldRent: 1660,
    newRent: 1810,
    editNumbers: false,
    checkIndex: 0,
    checkAnswers: { lastChange: null, reason: null, lowered: null },
    letterName: 'Antonio Santaniello',
    letterAddress: 'Wohnung 2a, Sonnenstrasse 2, 6014 Luzern',
    letterDate: '11.06.2026',
    copyHint: false,
    letterContacts: false,
  }

  function screenTop() {
    return '<div id="screen-top" class="screen-top" tabindex="-1" aria-hidden="true"></div>'
  }

  function pageTitle(text, className) {
    return '<h1 id="page-title" class="' + className + '" data-page-title>' + text + '</h1>'
  }

  function t(key, vars) {
    vars = vars || {}
    const dict = COPY[state.tone] || COPY.clear
    let s = dict[key] || COPY.clear[key] || key
    Object.keys(vars).forEach(function (k) {
      s = s.split('{' + k + '}').join(vars[k])
    })
    return s
  }

  function formatChf(n) {
    return Math.round(Number(n) || 0).toLocaleString('en-GB')
  }

  function formatChfCh(n) {
    return Math.round(Number(n) || 0).toLocaleString('de-CH')
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function monthlyDiff() {
    return Math.max(0, Number(state.newRent) - Number(state.oldRent))
  }

  function yearlyDiff() {
    return monthlyDiff() * 12
  }

  function startOfToday() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  function daysLeft() {
    const end = getDeadlineEnd()
    if (!end) return null
    const today = startOfToday()
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    return Math.round((e - today) / 86400000)
  }

  function ensureReceiptDate() {
    if (!state.receiptDate) state.receiptDate = startOfToday()
  }

  function toneBar() {
    const tones = [
      { id: 'clear', label: 'Clear' },
      { id: 'friendly', label: 'Friendly' },
    ]
    const segs = tones.map(function (tone) {
      const on = state.tone === tone.id
      return '<button type="button" class="tone-seg' + (on ? ' is-active' : '') + '"' +
        ' data-action="set-tone" data-tone="' + tone.id + '"' +
        ' aria-pressed="' + (on ? 'true' : 'false') + '">' + tone.label + '</button>'
    }).join('')
    return '<div class="tone-bar" role="group" aria-label="Tone of voice">' +
      '<div class="tone-bar__inner container">' +
      '<span class="tone-bar__label">Tone</span>' +
      '<div class="tone-switch">' + segs + '</div>' +
      '</div></div>'
  }

  function wrapPage(inner, extraTop, pageClass) {
    return '<div class="page' + (pageClass ? ' ' + pageClass : '') + '">' +
      screenTop() +
      '<div class="sticky-stack">' + toneBar() + (extraTop || '') + '</div>' +
      inner + trustFooter() + '</div>'
  }

  function addDays(date, days) {
    const r = new Date(date)
    r.setDate(r.getDate() + days)
    return r
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function parseDateInput(value) {
    if (!value) return null
    const parts = value.split('-').map(Number)
    const y = parts[0], m = parts[1], d = parts[2]
    const date = new Date(y, m - 1, d)
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
    return date
  }

  function toDateInputValue(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }

  function getDeadlineEnd() {
    return state.receiptDate ? addDays(state.receiptDate, DEADLINE_DAYS) : null
  }

  function loadDeadline() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      state.receiptDate = new Date(data.receiptDate)
    } catch (e) { /* ignore */ }
  }

  function saveDeadline() {
    const end = getDeadlineEnd()
    if (!state.receiptDate || !end) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      receiptDate: state.receiptDate.toISOString(),
      deadlineEnd: end.toISOString(),
    }))
    downloadIcs({
      title: 'Deadline: contest rent increase',
      startDate: end,
      description: 'Last day to contest the rent increase. 30 days from receipt (' + formatDate(state.receiptDate) + ').',
    })
    state.savedHint = true
    state.scrollAfterRender = false
    render()
  }

  function downloadIcs(event) {
    const pad = function (n) { return String(n).padStart(2, '0') }
    const fmt = function (d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) }
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      'DTSTART;VALUE=DATE:' + fmt(event.startDate),
      'SUMMARY:' + event.title,
      'DESCRIPTION:' + event.description,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
    a.download = 'rent-increase-deadline.ics'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function getTourImageSrc() {
    if (state.useReferenceImage || !state.croppedPhotoUrl) return REFERENCE_LETTER_SRC
    return state.croppedPhotoUrl
  }

  function captureFullImage(source, callback) {
    if (source instanceof HTMLVideoElement) {
      if (!source.videoWidth) {
        callback(null)
        return
      }
      const canvas = document.createElement('canvas')
      canvas.width = source.videoWidth
      canvas.height = source.videoHeight
      canvas.getContext('2d').drawImage(source, 0, 0)
      callback(canvas.toDataURL('image/jpeg', 0.92))
      return
    }
    const img = new Image()
    img.onload = function () {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      callback(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = function () { callback(null) }
    img.src = source
  }

  function stopCamera() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(function (track) { track.stop() })
      state.cameraStream = null
    }
  }

  function startCamera() {
    stopCamera()
    const video = document.getElementById('camera-video')
    if (!video || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 1920 } },
      audio: false,
    }).then(function (stream) {
      state.cameraStream = stream
      video.srcObject = stream
      video.play().catch(function () {})
      video.classList.add('is-live')
    }).catch(function () {})
  }

  function revokeCroppedPhoto() {
    if (state.croppedPhotoUrl && state.croppedPhotoUrl.indexOf('blob:') === 0) {
      URL.revokeObjectURL(state.croppedPhotoUrl)
    }
    if (state.croppedPhotoUrl && state.croppedPhotoUrl.indexOf('data:') === 0) {
      state.croppedPhotoUrl = null
    }
  }

  function clearScanTimer() {
    if (state.scanTimer) {
      clearTimeout(state.scanTimer)
      state.scanTimer = null
    }
  }

  function startRentIncreaseFlow(useReference) {
    stopCamera()
    state.useReferenceImage = useReference
    state.tourIndex = 0
    clearScanTimer()
    if (state.history[state.history.length - 1] !== SCREENS.SCANNING) {
      state.history.push(SCREENS.SCANNING)
    }
    state.screen = SCREENS.SCANNING
    state.scrollAfterRender = true
    render()
    state.scanTimer = setTimeout(function () {
      if (state.history[state.history.length - 1] === SCREENS.SCANNING) {
        state.history[state.history.length - 1] = SCREENS.COST
      } else {
        state.history.push(SCREENS.COST)
      }
      ensureReceiptDate()
      state.screen = SCREENS.COST
      state.scrollAfterRender = true
      render()
    }, SCAN_MS)
  }

  function forceScrollTop() {
    function scrollAll() {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      const anchor = document.getElementById('screen-top')
      if (anchor) anchor.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' })
      const title = document.getElementById('page-title')
      if (title) title.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' })
    }
    scrollAll()
    requestAnimationFrame(scrollAll)
    ;[0, 10, 50, 120, 250].forEach(function (ms) { setTimeout(scrollAll, ms) })
  }

  function navigate(next) {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur()
    clearScanTimer()
    if (next !== SCREENS.CAPTURE) stopCamera()
    state.screen = next
    state.history.push(next)
    state.savedHint = false
    state.scrollAfterRender = true
    render()
  }

  function goBack() {
    if (state.history.length <= 1) return
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur()
    clearScanTimer()
    state.history.pop()
    state.screen = state.history[state.history.length - 1]
    if (state.screen !== SCREENS.CAPTURE) stopCamera()
    state.savedHint = false
    state.scrollAfterRender = true
    render()
  }

  function goToTour() {
    state.tourIndex = 0
    navigate(SCREENS.TOUR)
  }

  function checkBack() {
    if (state.checkIndex > 0) {
      state.checkIndex -= 1
      state.scrollAfterRender = true
      render()
      return
    }
    goBack()
  }

  function submitCheckAnswer(value) {
    const q = CHECK_QUESTIONS[state.checkIndex]
    state.checkAnswers[q.key] = value
    if (state.checkIndex < CHECK_QUESTIONS.length - 1) {
      state.checkIndex += 1
      state.scrollAfterRender = true
      render()
      return
    }
    navigate(SCREENS.CHECK_RESULT)
  }

  function isYellowResult() {
    return state.checkAnswers.lastChange === 'lt1' && state.checkAnswers.reason === 'clear'
  }

  function letterGrounds() {
    const a = state.checkAnswers
    const grounds = []
    const reasonWeak = a.reason === 'vague' || a.reason === 'no' || a.reason === 'unsure'
    const noAnswers = !a.lastChange && !a.reason && !a.lowered

    if (noAnswers || reasonWeak) {
      grounds.push({
        text: 'The justification given is too general. It does not clearly and specifically explain why the rent should rise and by how much. Such a justification is not sufficient.',
        explain: 'the reasons given are too general',
      })
    }
    if (a.lastChange === 'lt1') {
      grounds.push({
        text: 'The rent was last adjusted less than one year ago. A further increase so soon is not sufficiently substantiated.',
        explain: 'the rent changed less than a year ago',
      })
    }
    if (a.lowered === 'no') {
      grounds.push({
        text: 'To my knowledge the rent has never been reduced, even though costs or the reference interest rate may have fallen in the meantime.',
        explain: 'the rent was never lowered',
      })
    }
    if (!grounds.length) {
      grounds.push({
        text: 'I request a review of whether the notified increase is justified in amount and in law.',
        explain: 'you asked for the increase to be reviewed',
      })
    }
    return grounds
  }

  function letterExplainText() {
    const bits = letterGrounds().map(function (g) { return g.explain })
    if (bits.length === 1) {
      return 'This short letter contests the increase because ' + bits[0] + ', and asks for a free hearing.'
    }
    const last = bits.pop()
    return 'This short letter contests the increase because ' + bits.join(', ') + ' and ' + last + ', and asks for a free hearing.'
  }

  function letterPlainText() {
    const grounds = letterGrounds().map(function (g) { return g.text }).join('\n\n')
    return 'Schlichtungsbehörde Miete und Pacht\n' +
      'Bahnhofstrasse 22, 6002 Lucerne\n\n' +
      'Subject: Contestation of the rent increase\n\n' +
      'Dear Sir or Madam\n\n' +
      'I hereby contest the rent increase of ' + state.letterDate +
      ' for the apartment at ' + state.letterAddress +
      ' as unfair. The rent is to be increased from CHF ' + formatChfCh(state.oldRent) +
      ' to CHF ' + formatChfCh(state.newRent) +
      ' per month.\n\n' +
      grounds + '\n\n' +
      'Please schedule a conciliation hearing.\n\n' +
      'Yours sincerely\n' +
      state.letterName + '\n\n' +
      'Signature'
  }

  function copyLetter() {
    const text = letterPlainText()
    function done() {
      state.copyHint = true
      state.scrollAfterRender = false
      render()
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done)
    } else {
      done()
    }
  }

  function printLetter() {
    document.body.classList.add('print-letter')
    window.print()
    setTimeout(function () { document.body.classList.remove('print-letter') }, 300)
  }

  function costHeadlineHtml() {
    const yearly = formatChf(yearlyDiff())
    const monthly = formatChf(monthlyDiff())
    const raw = t('costHeadline', { yearly: yearly, monthly: monthly })
    return escapeHtml(raw).replace(escapeHtml(yearly), '<span class="cost-amount">' + escapeHtml(yearly) + '</span>')
  }

  function updateCostFigures() {
    const headline = document.getElementById('page-title')
    const sub = document.getElementById('cost-sub')
    if (headline) headline.innerHTML = costHeadlineHtml()
    if (sub) sub.textContent = t('costSub', { monthly: formatChf(monthlyDiff()), yearly: formatChf(yearlyDiff()) })
  }

  function updateLetterPreview() {
    const map = {
      'letter-fill-date': state.letterDate,
      'letter-fill-address': state.letterAddress,
      'letter-fill-old': formatChfCh(state.oldRent),
      'letter-fill-new': formatChfCh(state.newRent),
      'letter-fill-name': state.letterName,
    }
    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id)
      if (el) el.textContent = map[id]
    })
  }

  function tourBack() {
    if (state.tourIndex > 0) {
      state.tourIndex -= 1
      state.scrollAfterRender = true
      render()
      return
    }
    goBack()
  }

  function tourNext() {
    if (state.tourIndex < LETTER_SECTIONS.length - 1) {
      state.tourIndex += 1
      state.scrollAfterRender = true
      render()
      return
    }
    navigate(SCREENS.ACTIONS)
  }

  function goToSection(index) {
    if (index < 0 || index >= LETTER_SECTIONS.length || index === state.tourIndex) return
    state.tourIndex = index
    state.scrollAfterRender = false
    state.focusActiveHotspot = true
    render()
  }

  function useReferenceForm() {
    state.useReferenceImage = true
    state.tourIndex = 0
    if (state.screen === SCREENS.TOUR) {
      state.scrollAfterRender = true
      render()
      return
    }
    startRentIncreaseFlow(true)
  }

  function trustFooter() {
    return '<footer class="trust-footer" role="contentinfo">' +
      '<p><strong>Your data stays on your device.</strong></p>' +
      '<p>Your photo is not saved or sent anywhere. This site offers guidance, not legal advice.</p>' +
      '</footer>'
  }

  function backButton(action) {
    const act = action || 'back'
    return '<button type="button" class="btn-back" data-action="' + act + '"><span aria-hidden="true">←</span> Back</button>'
  }

  function deadlineBanner(deadlineEnd, receiptDate) {
    let inner
    if (deadlineEnd) {
      inner = '<p>Deadline: ' + formatDate(deadlineEnd) + '</p>'
      if (receiptDate) inner += '<p>' + DEADLINE_DAYS + ' days from receipt (' + formatDate(receiptDate) + ')</p>'
    } else {
      inner = '<p>You have ' + DEADLINE_DAYS + ' days from when you received the letter.</p>'
    }
    return '<div class="deadline-banner" role="status" aria-live="polite">' + inner + '</div>'
  }

  function countdownBlock() {
    const days = daysLeft()
    const end = getDeadlineEnd()
    const dateValue = state.receiptDate ? toDateInputValue(state.receiptDate) : toDateInputValue(startOfToday())
    let msg
    if (days === null) {
      msg = t('countdownDays', { days: String(DEADLINE_DAYS) })
    } else if (days < 0) {
      msg = t('countdownOverdue')
    } else {
      msg = t('countdown', { date: formatDate(end), days: String(days) })
    }
    return '<div class="countdown-block">' +
      '<p class="countdown-block__kicker">You have 30 days to check it.</p>' +
      '<p class="countdown-block__msg" id="countdown-msg">' + escapeHtml(msg) + '</p>' +
      '<label for="receipt-date" class="field-label">' + escapeHtml(t('receiptLabel')) + '</label>' +
      '<input id="receipt-date" type="date" class="field-input" value="' + dateValue +
      '" max="' + toDateInputValue(startOfToday()) + '" data-action="date-change" />' +
      '</div>'
  }

  function heroIcon() {
    return '<div class="hero-icon" aria-hidden="true">' +
      '<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><rect x="8" y="10" width="32" height="28" rx="2" fill="#e6f4fa" stroke="#009fe3" stroke-width="2"/>' +
      '<path d="M8 16h32" stroke="#009fe3" stroke-width="2"/><circle cx="36" cy="12" r="8" fill="#009fe3"/></svg></div>'
  }

  function keyMessages(deadlineEnd) {
    const deadlineHtml = deadlineEnd ? '<p class="key-card__deadline">Deadline: ' + formatDate(deadlineEnd) + '</p>' : ''
    return '<section class="key-messages" aria-label="Key information">' +
      '<article class="key-card key-card--good"><p class="key-card__label">Good to know</p>' +
      '<p class="key-card__text">This is not the final word. You can have the increase reviewed for free.</p></article>' +
      '<article class="key-card key-card--deadline"><p class="key-card__label">You can still respond</p>' +
      '<p class="key-card__text">You have ' + DEADLINE_DAYS + ' days from when you received the letter to take action.</p>' +
      deadlineHtml + '</article></section>'
  }

  function zoneStyle(zone) {
    return 'top:' + zone.top + '%;left:' + zone.left + '%;width:' + zone.width + '%;height:' + zone.height + '%;'
  }

  function renderTourHighlight(activeIndex) {
    const hotspots = LETTER_SECTIONS.map(function (s, i) {
      const isActive = i === activeIndex
      return '<button type="button" class="tour-hotspot' + (isActive ? ' is-active' : '') + '"' +
        ' style="' + zoneStyle(s.zone) + '"' +
        ' data-action="tour-goto" data-index="' + i + '"' +
        ' aria-current="' + (isActive ? 'true' : 'false') + '">' +
        '<span class="tour-hotspot__num" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="sr-only">Section ' + (i + 1) + ': ' + s.title + '</span>' +
        '</button>'
    }).join('')

    return '<div class="tour-map">' +
      '<img class="tour-photo" src="' + getTourImageSrc() + '" alt="Your letter" />' +
      '<div class="tour-spotlight" style="' + zoneStyle(LETTER_SECTIONS[activeIndex].zone) + '" aria-hidden="true"></div>' +
      '<div class="tour-hotspots" role="group" aria-label="Sections on your letter">' + hotspots + '</div>' +
      '</div>'
  }

  function renderStart() {
    const steps = [
      { n: 1, title: t('step1Title'), text: t('step1Text') },
      { n: 2, title: t('step2Title'), text: t('step2Text') },
      { n: 3, title: t('step3Title'), text: t('step3Text') },
    ].map(function (s) {
      return '<li class="process-step"><span class="step-num" aria-hidden="true">' + s.n + '</span>' +
        '<div><p class="heading-sm">' + escapeHtml(s.title) + '</p><p class="lead">' + escapeHtml(s.text) + '</p></div></li>'
    }).join('')
    return wrapPage('<main class="main"><div class="container">' + heroIcon() +
      '<p class="lead mb-3">' + escapeHtml(t('startLead')) + '</p>' +
      pageTitle(escapeHtml(t('startTitle')), 'heading-xl mb-5') +
      '<p class="lead mb-8">' + escapeHtml(t('startSub')) + '</p>' +
      '<section class="card mb-10"><h2 class="heading-sm">' + escapeHtml(t('howTitle')) + '</h2><ol class="process-steps">' + steps + '</ol>' +
      '<p class="text-muted mt-3">' + escapeHtml(t('takesTime')) + '</p></section>' +
      '<button type="button" class="btn btn-primary" data-action="go-capture">' + escapeHtml(t('getStarted')) + '</button>' +
      '<p class="text-muted text-center mt-3">' + escapeHtml(t('startHint')) + '</p>' +
      '<div class="text-center mt-5"><button type="button" class="btn-link" data-action="go-capture">' + escapeHtml(t('chooseType')) + '</button></div>' +
      '</div></main>')
  }

  function renderCapture() {
    const types = LETTER_TYPES.map(function (t) {
      return '<li><button type="button" class="btn-list" data-action="select-type" data-type="' + t.id + '">' + t.label + '</button></li>'
    }).join('')
    return wrapPage('<main class="main"><div class="container">' + backButton() +
      pageTitle(escapeHtml(t('captureTitle')), 'heading-lg mb-3') +
      '<p class="lead mb-6">' + escapeHtml(t('captureLead')) + '</p>' +
      '<div class="camera-stage">' +
      '<p class="camera-hint">' + escapeHtml(t('cameraHint')) + '</p>' +
      '<div class="camera-frame" aria-hidden="true"></div></div>' +
      '<input type="file" accept="image/*" capture="environment" class="file-input" id="photo-input" data-action="photo-input" />' +
      '<input type="file" accept="image/*" class="file-input" id="gallery-input" data-action="photo-input" />' +
      '<button type="button" class="btn btn-primary" data-action="take-photo">' + escapeHtml(t('takePhoto')) + '</button>' +
      '<button type="button" class="btn btn-secondary mt-3" data-action="trigger-gallery">' + escapeHtml(t('uploadGallery')) + '</button>' +
      '<div class="divider"><div class="divider__line"></div><span class="text-muted">' + escapeHtml(t('orDivider')) + '</span><div class="divider__line"></div></div>' +
      '<h2 class="heading-md">' + escapeHtml(t('letterTypeHeading')) + '</h2>' +
      '<ul class="type-list" role="list">' + types + '</ul>' +
      '<p class="text-center mt-6"><button type="button" class="btn-link" data-action="use-reference">' + escapeHtml(t('continueExample')) + '</button></p>' +
      '</div></main>')
  }

  function renderScanning() {
    const src = getTourImageSrc()
    return wrapPage(
      '<main class="main scan-main"><div class="container scan-container">' +
      '<div class="scan-preview">' +
      '<img src="' + src + '" alt="" />' +
      '<div class="scan-line" aria-hidden="true"></div>' +
      '</div>' +
      '<p class="scan-title" role="status" aria-live="polite">' + escapeHtml(t('scanTitle')) + '</p>' +
      '<p class="text-muted">' + escapeHtml(t('scanSub')) + '</p>' +
      '</div></main>',
      '',
      'page--scan'
    )
  }

  function renderCost() {
    const yearly = formatChf(yearlyDiff())
    const monthly = formatChf(monthlyDiff())
    const edit = state.editNumbers
      ? '<div class="number-edit">' +
        '<label class="field-label" for="rent-old">Old rent incl. additional costs (CHF)</label>' +
        '<input id="rent-old" type="number" min="0" step="1" class="field-input" value="' + state.oldRent + '" data-action="rent-old" />' +
        '<label class="field-label" for="rent-new">New rent incl. additional costs (CHF)</label>' +
        '<input id="rent-new" type="number" min="0" step="1" class="field-input" value="' + state.newRent + '" data-action="rent-new" />' +
        '</div>'
      : ''
    return wrapPage(
      '<main class="main"><div class="container portfolio-block">' +
      backButton() +
      '<div class="new-panel">' +
      '<h1 id="page-title" class="cost-headline" data-page-title>' + costHeadlineHtml() + '</h1>' +
      '<p class="cost-sub" id="cost-sub">' + escapeHtml(t('costSub', { monthly: monthly, yearly: yearly })) + '</p>' +
      '</div>' +
      countdownBlock() +
      '<p class="text-center"><button type="button" class="btn-link" data-action="toggle-edit-numbers">Numbers not right? Edit</button></p>' +
      edit +
      '<div class="btn-stack mt-8">' +
      '<button type="button" class="btn btn-primary" data-action="go-check">' + escapeHtml(t('costCta')) + '</button>' +
      '<button type="button" class="btn btn-primary" data-action="go-tour">' + escapeHtml(t('costSkip')) + '</button>' +
      '</div></div></main>'
    )
  }

  function renderCheck() {
    const n = state.checkIndex + 1
    const total = CHECK_QUESTIONS.length
    const q = CHECK_QUESTIONS[state.checkIndex]
    const qKey = n === 1 ? 'q1' : (n === 2 ? 'q2' : 'q3')
    const selected = state.checkAnswers[q.key]
    const options = q.options.map(function (opt) {
      return '<button type="button" class="btn-choice' + (selected === opt.value ? ' is-selected' : '') + '"' +
        ' data-action="check-answer" data-value="' + opt.value + '">' + opt.label + '</button>'
    }).join('')
    return wrapPage(
      '<main class="main"><div class="container portfolio-block">' +
      backButton('check-back') +
      '<div class="new-panel">' +
      '<p class="check-progress" aria-live="polite">' + n + ' of ' + total + '</p>' +
      pageTitle(t(qKey), 'heading-lg mb-6') +
      '<div class="choice-stack" role="group" aria-label="Answers">' + options + '</div>' +
      '</div></div></main>'
    )
  }

  function renderCheckResult() {
    const yellow = isYellowResult()
    const title = yellow ? t('resultYellowTitle') : t('resultOrangeTitle')
    const text = yellow ? t('resultYellowText') : t('resultOrangeText')
    return wrapPage(
      '<main class="main"><div class="container portfolio-block">' +
      backButton() +
      '<div class="new-panel">' +
      '<article class="traffic-card' + (yellow ? ' traffic-card--yellow' : ' traffic-card--orange') + '">' +
      pageTitle(title, 'traffic-card__title') +
      '<p class="traffic-card__text">' + escapeHtml(text) + '</p>' +
      '</article>' +
      '<p class="proto-note">Prototype logic, simplified. Not legal advice.</p>' +
      '<div class="btn-stack mt-8">' +
      '<button type="button" class="btn btn-primary" data-action="go-letter">' + escapeHtml(t('resultLetterCta')) + '</button>' +
      '<button type="button" class="btn btn-secondary" data-action="go-tour">' + escapeHtml(t('resultTourCta')) + '</button>' +
      '</div></div></div></main>'
    )
  }

  function renderLetter() {
    const deadlineEnd = getDeadlineEnd()
    const deadlineLine = deadlineEnd
      ? '<p class="letter-deadline">Deadline: ' + formatDate(deadlineEnd) + '</p>'
      : '<p class="letter-deadline">You have 30 days from receipt.</p>'
    const copyMsg = state.copyHint ? '<p class="status-msg" role="status">Letter text copied.</p>' : ''
    const groundsHtml = letterGrounds().map(function (g) {
      return '<p>' + escapeHtml(g.text) + '</p>'
    }).join('')
    const sheet =
      '<article class="letter-sheet" id="letter-sheet">' +
      '<p class="letter-meta">Schlichtungsbehörde Miete und Pacht<br>Bahnhofstrasse 22, 6002 Lucerne</p>' +
      '<p class="letter-subject"><strong>Subject:</strong> Contestation of the rent increase</p>' +
      '<p>Dear Sir or Madam</p>' +
      '<p>I hereby contest the rent increase of ' +
      '<span class="letter-fill" id="letter-fill-date">' + escapeHtml(state.letterDate) + '</span>' +
      ' for the apartment at ' +
      '<span class="letter-fill" id="letter-fill-address">' + escapeHtml(state.letterAddress) + '</span>' +
      ' as unfair. The rent is to be increased from CHF ' +
      '<span class="letter-fill" id="letter-fill-old">' + escapeHtml(formatChfCh(state.oldRent)) + '</span>' +
      ' to CHF ' +
      '<span class="letter-fill" id="letter-fill-new">' + escapeHtml(formatChfCh(state.newRent)) + '</span>' +
      ' per month.</p>' +
      groundsHtml +
      '<p>Please schedule a conciliation hearing.</p>' +
      '<p>Yours sincerely</p>' +
      '<p><span class="letter-fill" id="letter-fill-name">' + escapeHtml(state.letterName) + '</span></p>' +
      '<p class="letter-sign">Signature<br><span class="letter-sign-line"></span></p>' +
      '</article>'
    return wrapPage(
      '<main class="main"><div class="container portfolio-block">' +
      backButton() +
      '<div class="new-panel">' +
      pageTitle(t('letterTitle'), 'heading-lg mb-3') +
      '<p class="lead mb-6">' + escapeHtml(t('letterIntro')) + '</p>' +
      '</div>' +
      '<div class="letter-fields">' +
      '<label class="field-label" for="letter-name">Your name</label>' +
      '<input id="letter-name" type="text" class="field-input" value="' + escapeHtml(state.letterName) + '" data-action="letter-name" autocomplete="name" />' +
      '<label class="field-label" for="letter-address">Your address</label>' +
      '<input id="letter-address" type="text" class="field-input" value="' + escapeHtml(state.letterAddress) + '" data-action="letter-address" autocomplete="street-address" />' +
      '<label class="field-label" for="letter-date">Date on the letter</label>' +
      '<input id="letter-date" type="text" class="field-input" value="' + escapeHtml(state.letterDate) + '" data-action="letter-date" />' +
      '</div>' +
      sheet +
      '<p class="letter-explain">' + escapeHtml(letterExplainText()) + '</p>' +
      copyMsg +
      '<div class="btn-stack mt-6">' +
      '<button type="button" class="btn btn-primary" data-action="print-letter">Print or save as PDF</button>' +
      '<button type="button" class="btn btn-secondary" data-action="copy-letter">Copy text</button>' +
      '</div>' +
      '<ol class="letter-steps" aria-label="What you do next">' +
      '<li><strong>1 Sign</strong></li>' +
      '<li><strong>2 Send it to the Schlichtungsbehörde by registered mail</strong></li>' +
      '<li><strong>3 Done – it\'s free</strong></li>' +
      '</ol>' +
      '<div class="btn-stack mt-6">' +
      '<button type="button" class="btn btn-secondary" data-action="toggle-letter-contacts">' +
      (state.letterContacts ? 'Hide contact points' : 'Show contact points') +
      '</button>' +
      '</div>' +
      (state.letterContacts
        ? '<div class="letter-contacts" id="letter-contacts">' +
          '<h2 class="heading-md">Where to send it</h2>' +
          '<p class="lead mb-6">The Schlichtungsbehörde is the office that receives the contestation. The Tenants\' Association can advise you.</p>' +
          contactCardsHtml() +
          '</div>'
        : '') +
      deadlineLine +
      '</div></main>'
    )
  }

  function renderTour() {
    const section = LETTER_SECTIONS[state.tourIndex]
    const n = state.tourIndex + 1
    const total = LETTER_SECTIONS.length
    const isRef = state.useReferenceImage || !state.croppedPhotoUrl
    const refNote = isRef ? '<p class="tour-ref-note">Showing the official example form. Your letter may look slightly different.</p>' : ''

    return wrapPage('<main class="main"><div class="container container--tour">' + backButton('tour-back') +
      '<p class="tour-progress" aria-live="polite">Section <strong>' + n + '</strong> of <strong>' + total + '</strong></p>' +
      pageTitle(section.title, 'heading-lg mb-4') +
      renderTourHighlight(state.tourIndex) +
      '<p class="tour-hint">Tap a marked area to read about it.</p>' + refNote +
      '<article class="card tour-text mb-4"><h2 class="heading-sm">What must be here?</h2><p>' + section.mustBe + '</p></article>' +
      '<article class="card tour-text tour-text--watch"><h2 class="heading-sm">What to watch out for</h2><p>' + section.watchOut + '</p></article>' +
      '<div class="btn-stack mt-8">' +
      (n < total
        ? '<button type="button" class="btn btn-primary" data-action="tour-next">Next section</button>' +
          '<button type="button" class="btn btn-secondary" data-action="go-actions">What can I do now?</button>'
        : '<button type="button" class="btn btn-primary" data-action="go-actions">What can I do now?</button>'
      ) +
      (isRef ? '' : '<button type="button" class="btn-link" data-action="use-reference">My photo does not match</button>') +
      '</div></div></main>', deadlineBanner(getDeadlineEnd(), state.receiptDate))
  }

  function renderSummary() {
    const deadlineEnd = getDeadlineEnd()
    const dateValue = state.receiptDate ? toDateInputValue(state.receiptDate) : ''
    const saveBtn = (state.receiptDate && deadlineEnd)
      ? '<button type="button" class="btn btn-secondary mb-3" data-action="save-deadline">Save deadline to calendar</button>' : ''
    const savedMsg = state.savedHint ? '<p class="status-msg" role="status">Deadline saved. Calendar file downloaded.</p>' : ''

    return wrapPage(
      '<main class="main"><div class="container">' + backButton() +
      '<p class="label-upper">Done</p>' +
      pageTitle('You walked through the whole form.', 'heading-xl mb-4') +
      '<p class="lead mb-6">This is a rent increase notice. You now know what each section is for.</p>' +
      keyMessages(deadlineEnd) +
      '<label for="receipt-date" class="field-label">When did you receive the letter? (optional)</label>' +
      '<input id="receipt-date" type="date" class="field-input" value="' + dateValue + '" max="' + toDateInputValue(new Date()) + '" data-action="date-change" />' +
      saveBtn + savedMsg +
      '<div class="btn-stack mt-8">' +
      '<button type="button" class="btn btn-accent" data-action="go-actions">What can I do?</button>' +
      '<button type="button" class="btn btn-secondary" data-action="restart-tour">Walk through sections again</button>' +
      '</div></div></main>',
      deadlineBanner(deadlineEnd, state.receiptDate)
    )
  }

  function contactCardsHtml() {
    return CONTACTS.map(function (c) {
      const phoneNote = c.phoneNote ? ', ' + c.phoneNote : ''
      const roleClass = c.role === 'authority' ? ' contact-card--send' : ' contact-card--advice'
      const tag = c.tag ? '<p class="contact-card__tag">' + escapeHtml(c.tag) + '</p>' : ''
      const email = c.email
        ? '<dt>Email</dt><dd><a class="link" href="mailto:' + encodeURIComponent(c.email).replace('%40', '@') + '">' +
          escapeHtml(c.email) + '</a></dd>'
        : ''
      return '<article class="card contact-card' + roleClass + '">' + tag +
        '<h3>' + escapeHtml(c.name) + '</h3><p class="subtitle">' + escapeHtml(c.subtitle) + '</p>' +
        '<dl><dt>Address</dt><dd>' + escapeHtml(c.address) + '</dd>' +
        '<dt>' + escapeHtml(c.phoneLabel) + '</dt><dd><a class="link" href="' + c.phoneHref + '">' +
        escapeHtml(c.phone) + '</a>' + escapeHtml(phoneNote) + '</dd>' +
        email +
        '<dt>Online</dt><dd><a class="link" href="' + c.link + '" target="_blank" rel="noopener">' +
        escapeHtml(c.linkLabel) +
        '<span class="sr-only"> (opens on an external website)</span></a></dd></dl></article>'
    }).join('')
  }

  function renderActions() {
    const deadlineEnd = getDeadlineEnd()
    const steps = ACTION_STEPS.map(function (s) {
      return '<li class="process-step"><span class="step-num step-num--accent" aria-hidden="true">' + s.n + '</span>' +
        '<div><h2 class="heading-sm">' + s.title + '</h2><p>' + s.text + '</p></div></li>'
    }).join('')
    const contacts = contactCardsHtml()
    return wrapPage(
      '<main class="main"><div class="container">' + backButton() +
      pageTitle('What can I do now?', 'heading-lg mb-8') +
      '<div class="new-panel mb-8">' +
      '<button type="button" class="btn btn-primary" data-action="go-letter">' + escapeHtml(t('resultLetterCta')) + '</button>' +
      '</div>' +
      '<ol class="steps-list">' + steps + '</ol>' +
      '<h2 class="heading-md">Where to get help</h2>' +
      '<p class="lead mb-6">Send the contestation to the Schlichtungsbehörde. The Tenants\' Association is for advice.</p>' +
      '<div class="mb-10">' + contacts + '</div>' +
      '<div class="card-highlight mb-8"><p>You are not alone with this, and you do not have to sign anything right away.</p></div>' +
      '<button type="button" class="btn btn-secondary" data-action="restart-tour">Walk through sections again</button>' +
      '</div></main>',
      deadlineBanner(deadlineEnd, state.receiptDate)
    )
  }

  function renderFallback() {
    return wrapPage(
      '<main class="main"><div class="container">' + backButton() +
      pageTitle('We cannot identify this letter yet.', 'heading-lg mb-4') +
      '<p class="lead mb-8">That is okay. There are places that can help with many kinds of letters.</p>' +
      '<article class="card"><h2 class="heading-sm">General support service</h2>' +
      '<p class="mb-6">Contact a local advice centre in your area.</p>' +
      '<p><a class="link" href="tel:0800800800">0800 800 800</a></p></article>' +
      '</div></main>'
    )
  }

  function render() {
    const app = document.getElementById('app')
    const shouldScroll = state.scrollAfterRender
    state.scrollAfterRender = true

    document.body.classList.toggle('print-letter', false)

    switch (state.screen) {
      case SCREENS.START: app.innerHTML = renderStart(); break
      case SCREENS.CAPTURE: app.innerHTML = renderCapture(); break
      case SCREENS.SCANNING: app.innerHTML = renderScanning(); break
      case SCREENS.COST: app.innerHTML = renderCost(); break
      case SCREENS.CHECK: app.innerHTML = renderCheck(); break
      case SCREENS.CHECK_RESULT: app.innerHTML = renderCheckResult(); break
      case SCREENS.LETTER: app.innerHTML = renderLetter(); break
      case SCREENS.TOUR: app.innerHTML = renderTour(); break
      case SCREENS.SUMMARY: app.innerHTML = renderSummary(); break
      case SCREENS.ACTIONS: app.innerHTML = renderActions(); break
      case SCREENS.FALLBACK: app.innerHTML = renderFallback(); break
    }

    if (shouldScroll) forceScrollTop()

    if (state.focusActiveHotspot) {
      state.focusActiveHotspot = false
      const active = app.querySelector('.tour-hotspot.is-active')
      if (active) active.focus({ preventScroll: true })
    }

    if (state.screen !== SCREENS.CAPTURE) stopCamera()
  }

  function handlePhotoFile(file) {
    if (!file) return
    const tempUrl = URL.createObjectURL(file)
    captureFullImage(tempUrl, function (full) {
      URL.revokeObjectURL(tempUrl)
      if (full) {
        state.croppedPhotoUrl = full
        state.useReferenceImage = false
      } else {
        state.useReferenceImage = true
      }
      startRentIncreaseFlow(state.useReferenceImage)
    })
  }

  function takeLivePhoto() {
    stopCamera()
    state.croppedPhotoUrl = DEMO_LETTER_SRC
    startRentIncreaseFlow(false)
  }

  document.getElementById('app').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action]')
    if (!btn || btn.tagName === 'INPUT') return
    const action = btn.getAttribute('data-action')
    const navigates = ['back', 'go-capture', 'go-actions', 'select-type', 'tour-back', 'tour-next', 'use-reference', 'restart-tour', 'take-photo', 'go-check', 'go-tour', 'go-letter', 'check-back', 'check-answer'].indexOf(action) >= 0
    if (navigates) {
      e.preventDefault()
      if (btn.blur) btn.blur()
    }
    switch (action) {
      case 'back': goBack(); break
      case 'tour-back': tourBack(); break
      case 'tour-next': tourNext(); break
      case 'check-back': checkBack(); break
      case 'go-capture': navigate(SCREENS.CAPTURE); break
      case 'go-actions': navigate(SCREENS.ACTIONS); break
      case 'go-check':
        state.checkIndex = 0
        navigate(SCREENS.CHECK)
        break
      case 'go-tour': goToTour(); break
      case 'go-letter':
        state.copyHint = false
        navigate(SCREENS.LETTER)
        break
      case 'check-answer': submitCheckAnswer(btn.getAttribute('data-value')); break
      case 'set-tone': {
        const next = btn.getAttribute('data-tone')
        state.tone = next === 'friendly' ? 'friendly' : 'clear'
        state.scrollAfterRender = false
        render()
        break
      }
      case 'toggle-edit-numbers':
        state.editNumbers = !state.editNumbers
        state.scrollAfterRender = false
        render()
        break
      case 'print-letter': printLetter(); break
      case 'copy-letter': copyLetter(); break
      case 'toggle-letter-contacts':
        state.letterContacts = !state.letterContacts
        state.scrollAfterRender = false
        render()
        if (state.letterContacts) {
          const box = document.getElementById('letter-contacts')
          if (box && box.scrollIntoView) box.scrollIntoView({ block: 'nearest' })
        }
        break
      case 'restart-tour':
        state.tourIndex = 0
        navigate(SCREENS.TOUR)
        break
      case 'use-reference': useReferenceForm(); break
      case 'tour-goto': goToSection(parseInt(btn.getAttribute('data-index'), 10)); break
      case 'trigger-photo': document.getElementById('photo-input').click(); break
      case 'trigger-gallery': document.getElementById('gallery-input').click(); break
      case 'take-photo': takeLivePhoto(); break
      case 'save-deadline': saveDeadline(); break
      case 'select-type': {
        const typeId = btn.getAttribute('data-type')
        if (typeId === 'mietzinserhohung') startRentIncreaseFlow(true)
        else navigate(SCREENS.FALLBACK)
        break
      }
    }
  })

  document.getElementById('app').addEventListener('change', function (e) {
    const el = e.target
    if (el.getAttribute('data-action') === 'photo-input' && el.files && el.files[0]) {
      handlePhotoFile(el.files[0])
    }
    if (el.getAttribute('data-action') === 'date-change') {
      state.receiptDate = parseDateInput(el.value) || startOfToday()
      state.savedHint = false
      state.scrollAfterRender = false
      render()
    }
  })

  document.getElementById('app').addEventListener('input', function (e) {
    const el = e.target
    const action = el.getAttribute('data-action')
    if (action === 'rent-old') {
      state.oldRent = parseFloat(el.value)
      if (isNaN(state.oldRent)) state.oldRent = 0
      updateCostFigures()
    }
    if (action === 'rent-new') {
      state.newRent = parseFloat(el.value)
      if (isNaN(state.newRent)) state.newRent = 0
      updateCostFigures()
    }
    if (action === 'letter-name') {
      state.letterName = el.value
      updateLetterPreview()
    }
    if (action === 'letter-address') {
      state.letterAddress = el.value
      updateLetterPreview()
    }
    if (action === 'letter-date') {
      state.letterDate = el.value
      updateLetterPreview()
    }
  })

  loadDeadline()
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.addEventListener('pagehide', stopCamera)
  render()
})()
