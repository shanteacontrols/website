(function () {
  var form = document.getElementById('sera-contact-form');
  var message = form.elements.message;
  var button = form.querySelector('.send-button');
  var status = form.querySelector('.contact-form-status');
  var fields = [form.elements.name, form.elements.email, message];
  var submitting = false;

  function validateMessage() {
    message.setCustomValidity(message.value.trim().length < 25
      ? 'Please enter at least 25 characters (excluding leading and trailing whitespace).'
      : '');
  }

  message.addEventListener('input', validateMessage);
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (submitting) return;
    validateMessage();
    if (!form.reportValidity()) return;

    // Capture the values before awaiting the anti-spam challenge.
    var payload = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      message: message.value.trim()
    };
    submitting = true;
    button.disabled = true;
    fields.forEach(function (field) { field.readOnly = true; });
    status.className = 'contact-form-status is-visible';
    status.textContent = 'Sending message...';

    try {
      // Use the explicit API so Botpoison cannot also submit the form automatically.
      var botpoison = new Botpoison({
        publicKey: 'pk_cf0b4aa4-5cde-4af9-b6ff-f3263297ec17'
      });
      var challenge = await botpoison.challenge();
      payload._botpoison = challenge.solution;
      var response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Submission failed');

      form.reset();
      message.setCustomValidity('');
      status.className = 'contact-form-status is-visible is-success';
      status.textContent = 'Message sent. Thank you! I will get back to you soon.';
    } catch (error) {
      status.className = 'contact-form-status is-visible';
      status.textContent = 'Unable to confirm your message was sent. Your text has been kept. Please try again.';
    } finally {
      submitting = false;
      button.disabled = false;
      fields.forEach(function (field) { field.readOnly = false; });
    }
  });
})();
