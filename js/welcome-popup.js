// =============================================================================
// Welcome Popup — Sedza & Lila
// =============================================================================
// On arrival, ask the guest whether they'll be attending. Shown once per
// browser session (sessionStorage). "Yes" / "No" close the popup and gently
// scroll the guest to the RSVP code box; "I've already answered" just closes.
// Reuses Magnific Popup (already loaded) and the .rsvp-popup-content styling.
// =============================================================================

$(document).ready(function () {

  var SESSION_KEY = 'welcomeSeen';

  // TESTING TOGGLE: set to true to show the popup on every reload.
  // Set back to false for production (shows once per browser session).
  var SHOW_EVERY_RELOAD = false;

  // Skip if already shown this session (unless testing on every reload).
  if (!SHOW_EVERY_RELOAD && sessionStorage.getItem(SESSION_KEY)) return;

  // Small delay so the popup doesn't fight the page loader (.fh5co-loader).
  setTimeout(function () {
    // Guard again in case something opened it in the meantime.
    if (!SHOW_EVERY_RELOAD && sessionStorage.getItem(SESSION_KEY)) return;

    $.magnificPopup.open({
      items          : { src: '#welcome-popup' },
      type           : 'inline',
      closeBtnInside : true,
      mainClass      : 'mfp-fade',
      callbacks      : {
        open : function () {
          // Mark as seen as soon as it opens, regardless of the choice made.
          sessionStorage.setItem(SESSION_KEY, '1');
          $('#page').addClass('blurred-bg');
        },
        close : function () {
          $('#page').removeClass('blurred-bg');
        }
      }
    });
  }, 600);

  // ── Scroll to the RSVP code box ──────────────────────────────────────────
  function goToRsvp() {
    var $rsvp = $('#fh5co-rsvp');
    if (!$rsvp.length) return;
    $('html, body').animate(
      { scrollTop: $rsvp.offset().top - 60 },
      800,
      'easeInOutExpo',
      function () { $('#rsvp-code-input').focus(); }
    );
  }

  // Yes / No → close, then scroll to the RSVP section.
  $(document).on('click', '.welcome-choice', function (e) {
    e.preventDefault();
    $.magnificPopup.close();
    // Wait for the close animation before scrolling.
    setTimeout(goToRsvp, 200);
  });

  // "I've already answered" → just dismiss.
  $(document).on('click', '.welcome-dismiss', function (e) {
    e.preventDefault();
    $.magnificPopup.close();
  });

});
