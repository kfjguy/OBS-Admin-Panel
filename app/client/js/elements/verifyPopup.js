(function() {
  function createModal() {
    if (document.getElementById('verifyPopup')) return;

    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'verifyPopup';

    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Message paragraph
    const messagePara = document.createElement('p');
    messagePara.id = 'verifyMessage';

    // Yes button
    const yesButton = document.createElement('button');
    yesButton.id = 'yesButton';
    yesButton.textContent = 'Yes';

    // No button
    const noButton = document.createElement('button');
    noButton.id = 'noButton';
    noButton.textContent = 'No';

    // Append elements
    modalContent.appendChild(messagePara);
    modalContent.appendChild(yesButton);
    modalContent.appendChild(noButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }

  // Function to display the confirmation popup
  window.verifyPopup = function(message) {
    return new Promise(function(resolve) {
      createModal();
      document.getElementById('verifyMessage').textContent = message;

      // Show the modal
      const modal = document.getElementById('verifyPopup');
      modal.style.display = 'block';

      // Handlers for Yes and No buttons
      function handleYes() {
        cleanup();
        resolve(true);
      }
      function handleNo() {
        cleanup();
        resolve(false);
      }
      function cleanup() {
        document.getElementById('yesButton').removeEventListener('click', handleYes);
        document.getElementById('noButton').removeEventListener('click', handleNo);
        modal.style.display = 'none';
      }

      // Add event listeners
      document.getElementById('yesButton').addEventListener('click', handleYes);
      document.getElementById('noButton').addEventListener('click', handleNo);
    });
  };
})();