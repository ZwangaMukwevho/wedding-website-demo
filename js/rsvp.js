// =============================================================================
// RSVP — Sedza & Lila
// =============================================================================
// After deploying the Google Apps Script (google-apps-script/Code.gs),
// paste the deployment URL below.
// =============================================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwRhI-k6iuIZw69cZBAYR670IfLEPvfxB2NuBquh9bF7g96JkWf9Ej5cLtmJ9r_H_3YA/exec';

$(document).ready(function () {

  let currentCode   = '';
  let currentChoice = '';

  // ── Helpers ────────────────────────────────────────────────────────────────

  function showStep(id) {
    $('#rsvp-step-choice, #rsvp-step-message, #rsvp-step-thankyou').hide();
    $(id).show();
  }

  function resetPopup() {
    $('#rsvp-message').val('');
    $('#rsvp-submit-error').hide();
    $('#rsvp-confirm-btn').text('Confirm RSVP').prop('disabled', false);
    $('#rsvp-gifts-btn').hide();
    showStep('#rsvp-step-choice');
  }

  // ── Step 1: Validate the invite code ──────────────────────────────────────

  function lookupCode() {
    const code = $('#rsvp-code-input').val().trim().toUpperCase();
    if (!code) return;

    $('#rsvp-error').hide();
    $('#rsvp-lookup-btn').text('Checking…').prop('disabled', true);

    fetch(APPS_SCRIPT_URL + '?action=lookup&code=' + encodeURIComponent(code))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          currentCode = code;
          resetPopup();
          $('#rsvp-guest-name').text('Welcome, ' + data.name + '! 🎉');

          $.magnificPopup.open({
            items      : { src: '#rsvp-popup' },
            type       : 'inline',
            closeBtnInside : true,
            mainClass  : 'mfp-fade'
          });
        } else {
          $('#rsvp-error').fadeIn();
        }
      })
      .catch(function () {
        $('#rsvp-error').fadeIn();
      })
      .finally(function () {
        $('#rsvp-lookup-btn').text('Find my invite').prop('disabled', false);
      });
  }

  // Trigger lookup on button click or Enter key
  $('#rsvp-lookup-btn').on('click', lookupCode);

  $('#rsvp-code-input').on('keypress', function (e) {
    if (e.which === 13) lookupCode();
  });

  // Auto-uppercase and strip non-alphanumeric as user types
  $('#rsvp-code-input').on('input', function () {
    var pos = this.selectionStart;
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.setSelectionRange(pos, pos);
  });

  // ── Step 2: Guest picks Attending or Declined ──────────────────────────────

  $(document).on('click', '.rsvp-choice', function () {
    currentChoice     = $(this).data('choice');
    var isAttending   = currentChoice === 'Attending';

    // Mirror the name into step 2
    $('#rsvp-guest-name-2').text($('#rsvp-guest-name').text());

    $('#rsvp-choice-label').text(
      isAttending
        ? "We're so glad! Leave a note for the couple if you'd like."
        : "We'll miss you! Feel free to leave a message for Liladzani & Sedza."
    );

    showStep('#rsvp-step-message');
  });

  // ── Step 3: Submit the RSVP ────────────────────────────────────────────────

  $('#rsvp-confirm-btn').on('click', function () {
    var message = $('#rsvp-message').val().trim();

    $('#rsvp-submit-error').hide();
    $('#rsvp-confirm-btn').text('Sending…').prop('disabled', true);

    var url = APPS_SCRIPT_URL
      + '?action=submit'
      + '&code='    + encodeURIComponent(currentCode)
      + '&rsvp='    + encodeURIComponent(currentChoice)
      + '&message=' + encodeURIComponent(message);

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          var isAttending = currentChoice === 'Attending';

          $('#rsvp-thankyou-heading').text(
            isAttending
              ? 'See you there! 🎉'
              : "We're sorry you can't make it 💕"
          );
          $('#rsvp-thankyou-msg').text(
            isAttending
              ? "We can't wait to celebrate with you on the big day!"
              : 'But you can still share in our forever in the following ways:'
          );

          // For declines, offer a gentle nudge towards the Gifts section.
          $('#rsvp-gifts-btn').toggle(!isAttending);

          showStep('#rsvp-step-thankyou');
        } else {
          $('#rsvp-submit-error').fadeIn();
          $('#rsvp-confirm-btn').text('Confirm RSVP').prop('disabled', false);
        }
      })
      .catch(function () {
        $('#rsvp-submit-error').fadeIn();
        $('#rsvp-confirm-btn').text('Confirm RSVP').prop('disabled', false);
      });
  });

});
