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
    TOUR: 'tour',
    SUMMARY: 'summary',
    ACTIONS: 'actions',
    FALLBACK: 'fallback',
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
      name: 'Tenancy Mediation Authority',
      subtitle: 'Canton of Lucerne',
      address: 'Bahnhofstrasse 22, 6002 Lucerne',
      phoneLabel: 'Advice by phone',
      phone: '041 228 63 66',
      phoneHref: 'tel:0412286366',
      phoneNote: 'Tuesday and Thursday, 2–5 pm',
      link: 'https://gerichte.lu.ch/organisation/schlichtungsbehoerden/miete_pacht',
      linkLabel: 'gerichte.lu.ch',
    },
    {
      name: 'Tenants\' Association',
      subtitle: 'Lucerne, Nidwalden, Obwalden, Uri',
      address: 'Hertensteinstrasse 40, 6004 Lucerne',
      phoneLabel: 'Phone',
      phone: '041 220 10 22',
      phoneHref: 'tel:0412201022',
      link: 'https://www.mieterverband.ch/mietrecht/waehrend-der-miete/mietzinserhohung/',
      linkLabel: 'mieterverband.ch – Rent increases',
    },
  ]

  const PROCESS_STEPS = [
    { n: 1, title: 'Show your letter', text: 'Take a photo inside the frame.' },
    { n: 2, title: 'Walk through sections', text: 'We guide you through each part of the form.' },
    { n: 3, title: 'Next step', text: 'You see what you can do.' },
  ]

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
  }

  function screenTop() {
    return '<div id="screen-top" class="screen-top" tabindex="-1" aria-hidden="true"></div>'
  }

  function pageTitle(text, className) {
    return '<h1 id="page-title" class="' + className + '" data-page-title>' + text + '</h1>'
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
        state.history[state.history.length - 1] = SCREENS.TOUR
      } else {
        state.history.push(SCREENS.TOUR)
      }
      state.screen = SCREENS.TOUR
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
    state.scrollAfterRender = true
    if (state.screen !== SCREENS.TOUR) {
      navigate(SCREENS.TOUR)
    } else {
      render()
    }
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

  function heroIcon() {
    return '<div class="hero-icon" aria-hidden="true">' +
      '<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><rect x="8" y="10" width="32" height="28" rx="3" fill="#e8f0ee" stroke="#245656" stroke-width="2"/>' +
      '<path d="M8 16h32" stroke="#245656" stroke-width="2"/><circle cx="36" cy="12" r="8" fill="#245656"/></svg></div>'
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
    const steps = PROCESS_STEPS.map(function (s) {
      return '<li class="process-step"><span class="step-num" aria-hidden="true">' + s.n + '</span>' +
        '<div><p class="heading-sm">' + s.title + '</p><p class="lead">' + s.text + '</p></div></li>'
    }).join('')
    return '<div class="page">' + screenTop() + '<main class="main"><div class="container">' + heroIcon() +
      '<p class="lead mb-3">An official letter can feel unsettling. That is understandable.</p>' +
      pageTitle('We help you understand it.', 'heading-xl mb-5') +
      '<p class="lead mb-8">In plain language. Section by section. No legal jargon.</p>' +
      '<section class="card mb-10"><h2 class="heading-sm">How it works</h2><ol class="process-steps">' + steps + '</ol>' +
      '<p class="text-muted mt-3">Takes about 3 minutes.</p></section>' +
      '<button type="button" class="btn btn-primary" data-action="go-capture">Get started</button>' +
      '<p class="text-muted text-center mt-3">Take a photo or choose a letter type</p>' +
      '<div class="text-center mt-5"><button type="button" class="btn-link" data-action="go-capture">Choose letter type instead</button></div>' +
      '</div></main>' + trustFooter() + '</div>'
  }

  function renderCapture() {
    const types = LETTER_TYPES.map(function (t) {
      return '<li><button type="button" class="btn-list" data-action="select-type" data-type="' + t.id + '">' + t.label + '</button></li>'
    }).join('')
    return '<div class="page">' + screenTop() + '<main class="main"><div class="container">' + backButton() +
      pageTitle('Photograph your letter', 'heading-lg mb-3') +
      '<p class="lead mb-6">Place the whole letter inside the frame. You can also upload a photo from your gallery.</p>' +
      '<div class="camera-stage">' +
      '<p class="camera-hint">Place the whole letter inside the frame</p>' +
      '<div class="camera-frame" aria-hidden="true"></div></div>' +
      '<input type="file" accept="image/*" capture="environment" class="file-input" id="photo-input" data-action="photo-input" />' +
      '<input type="file" accept="image/*" class="file-input" id="gallery-input" data-action="photo-input" />' +
      '<button type="button" class="btn btn-primary" data-action="take-photo">Take photo</button>' +
      '<button type="button" class="btn btn-secondary mt-3" data-action="trigger-gallery">Upload from gallery</button>' +
      '<div class="divider"><div class="divider__line"></div><span class="text-muted">or</span><div class="divider__line"></div></div>' +
      '<h2 class="heading-md">What kind of letter did you receive?</h2>' +
      '<ul class="type-list" role="list">' + types + '</ul>' +
      '<p class="text-center mt-6"><button type="button" class="btn-link" data-action="use-reference">Continue with example form (no photo)</button></p>' +
      '</div></main>' + trustFooter() + '</div>'
  }

  function renderScanning() {
    const src = getTourImageSrc()
    return '<div class="page page--scan">' + screenTop() +
      '<main class="main scan-main"><div class="container scan-container">' +
      '<div class="scan-preview">' +
      '<img src="' + src + '" alt="" />' +
      '<div class="scan-line" aria-hidden="true"></div>' +
      '</div>' +
      '<p class="scan-title" role="status" aria-live="polite">Scanning your letter…</p>' +
      '<p class="text-muted">Finding the sections on your form</p>' +
      '</div></main>' + trustFooter() + '</div>'
  }

  function renderTour() {
    const section = LETTER_SECTIONS[state.tourIndex]
    const n = state.tourIndex + 1
    const total = LETTER_SECTIONS.length
    const isRef = state.useReferenceImage || !state.croppedPhotoUrl
    const refNote = isRef ? '<p class="tour-ref-note">Showing the official example form. Your letter may look slightly different.</p>' : ''

    return '<div class="page">' + screenTop() + deadlineBanner(getDeadlineEnd(), state.receiptDate) +
      '<main class="main"><div class="container">' + backButton('tour-back') +
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
      '</div></div></main>' + trustFooter() + '</div>'
  }

  function renderSummary() {
    const deadlineEnd = getDeadlineEnd()
    const dateValue = state.receiptDate ? toDateInputValue(state.receiptDate) : ''
    const saveBtn = (state.receiptDate && deadlineEnd)
      ? '<button type="button" class="btn btn-secondary mb-3" data-action="save-deadline">Save deadline to calendar</button>' : ''
    const savedMsg = state.savedHint ? '<p class="status-msg" role="status">Deadline saved. Calendar file downloaded.</p>' : ''

    return '<div class="page">' + screenTop() + deadlineBanner(deadlineEnd, state.receiptDate) +
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
      '</div></div></main>' + trustFooter() + '</div>'
  }

  function renderActions() {
    const deadlineEnd = getDeadlineEnd()
    const steps = ACTION_STEPS.map(function (s) {
      return '<li class="process-step"><span class="step-num step-num--accent" aria-hidden="true">' + s.n + '</span>' +
        '<div><h2 class="heading-sm">' + s.title + '</h2><p>' + s.text + '</p></div></li>'
    }).join('')
    const contacts = CONTACTS.map(function (c) {
      const phoneNote = c.phoneNote ? ', ' + c.phoneNote : ''
      return '<article class="card contact-card"><h3>' + c.name + '</h3><p class="subtitle">' + c.subtitle + '</p>' +
        '<dl><dt>Address</dt><dd>' + c.address + '</dd>' +
        '<dt>' + c.phoneLabel + '</dt><dd><a class="link" href="' + c.phoneHref + '">' + c.phone + '</a>' + phoneNote + '</dd>' +
        '<dt>Online</dt><dd><a class="link" href="' + c.link + '" target="_blank" rel="noopener">' + c.linkLabel +
        '<span class="sr-only"> (opens on an external website)</span></a></dd></dl></article>'
    }).join('')
    return '<div class="page">' + screenTop() + deadlineBanner(deadlineEnd, state.receiptDate) +
      '<main class="main"><div class="container">' + backButton() +
      pageTitle('What can I do now?', 'heading-lg mb-8') +
      '<ol class="steps-list">' + steps + '</ol>' +
      '<h2 class="heading-md">Where to get help</h2><div class="mb-10">' + contacts + '</div>' +
      '<div class="card-highlight mb-8"><p>You are not alone with this, and you do not have to sign anything right away.</p></div>' +
      '<button type="button" class="btn btn-secondary" data-action="restart-tour">Walk through sections again</button>' +
      '</div></main>' + trustFooter() + '</div>'
  }

  function renderFallback() {
    return '<div class="page">' + screenTop() + '<main class="main"><div class="container">' + backButton() +
      pageTitle('We cannot identify this letter yet.', 'heading-lg mb-4') +
      '<p class="lead mb-8">That is okay. There are places that can help with many kinds of letters.</p>' +
      '<article class="card"><h2 class="heading-sm">General support service</h2>' +
      '<p class="mb-6">Contact a local advice centre in your area.</p>' +
      '<p><a class="link" href="tel:0800800800">0800 800 800</a></p></article>' +
      '</div></main>' + trustFooter() + '</div>'
  }

  function render() {
    const app = document.getElementById('app')
    const shouldScroll = state.scrollAfterRender
    state.scrollAfterRender = true

    switch (state.screen) {
      case SCREENS.START: app.innerHTML = renderStart(); break
      case SCREENS.CAPTURE: app.innerHTML = renderCapture(); break
      case SCREENS.SCANNING: app.innerHTML = renderScanning(); break
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
    const navigates = ['back', 'go-capture', 'go-actions', 'select-type', 'tour-back', 'tour-next', 'use-reference', 'restart-tour', 'take-photo'].indexOf(action) >= 0
    if (navigates) {
      e.preventDefault()
      if (btn.blur) btn.blur()
    }
    switch (action) {
      case 'back': goBack(); break
      case 'tour-back': tourBack(); break
      case 'tour-next': tourNext(); break
      case 'go-capture': navigate(SCREENS.CAPTURE); break
      case 'go-actions': navigate(SCREENS.ACTIONS); break
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
      state.receiptDate = parseDateInput(el.value)
      state.savedHint = false
      state.scrollAfterRender = false
      render()
    }
  })

  loadDeadline()
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.addEventListener('pagehide', stopCamera)
  render()
})()
