(() => {
  const state = { selectedMap: null, selectedFriends: new Set() };

  const mapCards = document.querySelectorAll('.map-card');
  const friendCards = document.querySelectorAll('.character-card');
  const startBtn = document.getElementById('start-btn');
  const toast = document.getElementById('toast');

  if (!startBtn || !toast) return;

  const totalFriends = friendCards.length;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function updateButton() {
    const allReady = state.selectedMap && state.selectedFriends.size === totalFriends;
    startBtn.disabled = !allReady;
    if (allReady) {
      startBtn.textContent = `Journey to ${state.selectedMap}`;
    } else if (state.selectedMap) {
      const remaining = totalFriends - state.selectedFriends.size;
      startBtn.textContent = `Awaiting ${remaining} companion${remaining > 1 ? 's' : ''}…`;
    } else {
      startBtn.textContent = 'Embark on Quest';
    }
  }

  function selectMap(card) {
    mapCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.selectedMap = card.dataset.map;
    updateButton();
  }

  function toggleFriend(card) {
    const name = card.dataset.friend;
    if (state.selectedFriends.has(name)) {
      state.selectedFriends.delete(name);
      card.classList.remove('selected');
    } else {
      state.selectedFriends.add(name);
      card.classList.add('selected');
    }
    updateButton();
  }

  mapCards.forEach(card => card.addEventListener('click', () => selectMap(card)));
  friendCards.forEach(card => card.addEventListener('click', () => toggleFriend(card)));

  startBtn.addEventListener('click', () => {
    if (!state.selectedMap || state.selectedFriends.size !== totalFriends) return;
    showToast(`📜 The pact is sealed! Thy fellowship departs for ${state.selectedMap}! Prepare thy inventory!`);
    document.body.classList.add('flash');
    setTimeout(() => document.body.classList.remove('flash'), 800);
  });
})();
