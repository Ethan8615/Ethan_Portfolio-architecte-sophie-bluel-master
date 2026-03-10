const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");

let works = [];
let categoriesList = [];

// Global notice element (used to show network/backend errors)
let globalNotice = document.querySelector('.global-notice');
if (!globalNotice) {
  globalNotice = document.createElement('div');
  globalNotice.className = 'global-notice';
  globalNotice.style.display = 'none';
  document.body.insertBefore(globalNotice, document.body.firstChild);
}

function showGlobalNotice(message, timeout = 6000) {
  globalNotice.textContent = message;
  globalNotice.style.display = 'block';
  clearTimeout(globalNotice._hideTimer);
  if (timeout > 0) {
    globalNotice._hideTimer = setTimeout(() => {
      globalNotice.style.display = 'none';
    }, timeout);
  }
}

// Only run gallery/category code when the related elements exist (e.g. not on login page)
if (gallery && filtersContainer) {
  /* ---------- Affichage des travaux ---------- */
  function displayWorks(worksToDisplay) {
    gallery.innerHTML = "";

    worksToDisplay.forEach(work => {
      const figure = document.createElement("figure");
      figure.dataset.id = work.id;

      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      const figcaption = document.createElement("figcaption");
      figcaption.textContent = work.title;

      figure.appendChild(img);
      figure.appendChild(figcaption);
      gallery.appendChild(figure);
    });
  }

  /* ---------- Filtrage ---------- */
  function filterWorks(categoryId) {
    if (categoryId === "all") {
      displayWorks(works);
    } else {
      const filteredWorks = works.filter(
        work => work.categoryId === Number(categoryId)
      );
      displayWorks(filteredWorks);
    }
  }

  /* ---------- Création des boutons ---------- */
  function createFilterButton(name, id) {
    const button = document.createElement("button");
    button.textContent = name;
    button.dataset.id = id;
    button.classList.add("filter-btn");

    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn")
        .forEach(btn => btn.classList.remove("active"));

      button.classList.add("active");
      filterWorks(id);
    });

    return button;
  }

  /* ---------- Fetch des travaux ---------- */
  fetch("http://localhost:5678/api/works")
    .then(res => res.json())
    .then(data => {
      works = data;
      displayWorks(works);
    })
    .catch(err => {
      console.error('Error fetching works:', err);
      showGlobalNotice('Impossible de charger les travaux : le serveur est injoignable.');
    });

  /* ---------- Bouton Tous ---------- */
  const allButton = createFilterButton("Tous", "all");
  allButton.classList.add("active");
  filtersContainer.appendChild(allButton);

  /* ---------- Fetch des catégories ---------- */
  fetch("http://localhost:5678/api/categories")
    .then(res => res.json())
    .then(categories => {
      categoriesList = categories;
      categories.forEach(category => {
        const button = createFilterButton(category.name, category.id);
        filtersContainer.appendChild(button);
      });
    })
    .catch(err => {
      console.error('Error fetching categories:', err);
      showGlobalNotice('Impossible de charger les catégories : le serveur est injoignable.');
    });

  // create single edit modal and button
  const editBtn = document.getElementById('edit-projects-btn');
  // create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Galerie photo">
      <div class="modal-header">
        <button class="modal-back" aria-label="Retour" style="display:none">◂</button>
        <h3>Galerie photo</h3>
        <button class="modal-close" aria-label="Fermer">✕</button>
      </div>
      <div class="modal-message" aria-live="polite"></div>
      <div class="thumbnails"></div>
      <div class="upload-area" style="display:none;">
        <form class="upload-form" style="margin-top:12px;" enctype="multipart/form-data">
          <div class="upload-preview" style="margin-bottom:18px;">
            <div class="upload-preview-box" style="width:320px; height:120px; margin:0 auto; background:#eef7fb; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:6px; padding:12px; box-sizing:border-box;">
              <img class="preview-img" src="" alt="Aperçu sélectionné" style="max-width:100%; max-height:64px; display:none; object-fit:cover; border-radius:4px; margin-bottom:8px;" />
              <div class="preview-placeholder" style="display:flex; flex-direction:column; align-items:center; gap:8px; color:#7b8a90;">
                <svg width="40" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 19V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12" stroke="#9aa8ad" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 15l4-4 4 4 5-6 5 6" stroke="#9aa8ad" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <button type="button" class="browse-btn" aria-label="Ajouter une photo">+ Ajouter photo</button>
                <div class="upload-hint" style="font-size:12px; color:#97a3a6;">jpg, png ; 4mo max</div>
              </div>
            </div>
          </div>
          <label>Titre<br><input type="text" name="title" required></label>
          <label>Catégorie<br>
            <select name="category" required>
              <option value="">Choisir...</option>
            </select>
          </label>
          <input type="file" name="image" accept="image/*" required aria-label="Fichier image" />
          <div style="margin-top:18px; text-align:center;"><button type="submit" class="validate-btn">Valider</button></div>
        </form>
      </div>
      <hr />
      <div class="modal-footer">
        <button class="add-photo-btn">Ajouter une photo</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  function openModal() {
    const thumbs = modalOverlay.querySelector('.thumbnails');
    // ensure we start in gallery view
    try { showGalleryView(); } catch (e) { /* ignore */ }
    thumbs.innerHTML = '';
    // populate thumbnails from works
  works.forEach(w => {
      const item = document.createElement('div');
      item.className = 'thumb-item';
      item.dataset.id = w.id;
      const img = document.createElement('img');
      img.src = w.imageUrl;
      img.alt = w.title || '';
      item.appendChild(img);
      // delete button (visible only if token)
      const token = localStorage.getItem('token');
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'thumb-delete';
      del.title = 'Supprimer';
      // SVG trash icon for crisper rendering
      del.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 6h18" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 11v6" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <path d="M14 11v6" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
  // visibility of delete buttons is handled via CSS when body has .authenticated
      item.appendChild(del);
      thumbs.appendChild(item);
    });
    // populate category select
    const select = modalOverlay.querySelector('select[name="category"]');
    if (select) {
      select.innerHTML = '<option value="">Choisir...</option>';
      categoriesList.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
      });
    }
    modalOverlay.classList.add('open');
  }

  // helper: show upload form in place of thumbnails (and show back button)
  function showUploadFormView() {
    const thumbs = modalOverlay.querySelector('.thumbnails');
    const uploadArea = modalOverlay.querySelector('.upload-area');
    const addBtn = modalOverlay.querySelector('.add-photo-btn');
    const backBtn = modalOverlay.querySelector('.modal-back');
    if (thumbs) thumbs.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';
    if (addBtn) addBtn.style.display = 'none';
    if (backBtn) backBtn.style.display = 'inline-block';
  }

  function showGalleryView() {
    const thumbs = modalOverlay.querySelector('.thumbnails');
    const uploadArea = modalOverlay.querySelector('.upload-area');
    const addBtn = modalOverlay.querySelector('.add-photo-btn');
    const backBtn = modalOverlay.querySelector('.modal-back');
    if (thumbs) thumbs.style.display = '';
    if (uploadArea) uploadArea.style.display = 'none';
    if (addBtn) addBtn.style.display = 'inline-block';
    if (backBtn) backBtn.style.display = 'none';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  // events
  if (editBtn) editBtn.addEventListener('click', openModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay || e.target.classList.contains('modal-close')) closeModal();
    // delete handler
    if (e.target.classList && e.target.classList.contains('thumb-delete')) {
      const item = e.target.closest('.thumb-item');
      const id = item && item.dataset.id;
      const token = localStorage.getItem('token');
      if (!token) {
        const msg = modalOverlay.querySelector('.modal-message');
        if (msg) { msg.textContent = 'Vous devez être connecté pour supprimer une photo.'; }
        return;
      }
      if (!id) return;
      // send DELETE
      fetch('http://localhost:5678/api/works/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(res => {
        if (res.status === 204) {
          // remove from DOM and works array
          item.remove();
          works = works.filter(w => String(w.id) !== String(id));
          // remove from gallery
          const fig = document.querySelector('figure[data-id="' + id + '"]');
          if (fig) fig.remove();
        } else {
          return res.json().then(j => { throw new Error(j.message || 'Erreur'); });
        }
      }).catch(err => {
        console.error('Delete error', err);
        const msg = modalOverlay.querySelector('.modal-message');
        if (msg) { msg.textContent = 'Impossible de supprimer : ' + (err.message || 'erreur'); }
      });
    }
    // add photo button - switch to form view
    if (e.target.classList && e.target.classList.contains('add-photo-btn')) {
      showUploadFormView();
    }
    // back button - return to gallery view
    if (e.target.classList && e.target.classList.contains('modal-back')) {
      showGalleryView();
    }
  });

  // upload form submit
  const uploadForm = modalOverlay.querySelector('.upload-form');
  if (uploadForm) {
    // wire file input -> preview
    const fileInput = uploadForm.querySelector('input[type="file"]');
    const previewImg = modalOverlay.querySelector('.preview-img');
    const previewBox = modalOverlay.querySelector('.upload-preview-box');
    if (fileInput && previewImg) {
      const previewPlaceholder = modalOverlay.querySelector('.preview-placeholder');
      fileInput.addEventListener('change', (ev) => {
        const f = ev.target.files && ev.target.files[0];
        if (!f) {
          // no file: show placeholder, hide preview
          previewImg.src = '';
          previewImg.style.display = 'none';
          if (previewPlaceholder) previewPlaceholder.style.display = 'flex';
          return;
        }
        // hide placeholder when a file is selected
        if (previewPlaceholder) previewPlaceholder.style.display = 'none';
        // show a preview with object URL
        try {
          const url = URL.createObjectURL(f);
          previewImg.onload = () => { URL.revokeObjectURL(url); };
          previewImg.src = url;
          previewImg.style.display = 'block';
          // center visually by ensuring box keeps its bg when image smaller
        } catch (e) {
          // fallback to FileReader
          const reader = new FileReader();
          reader.onload = () => {
            previewImg.src = reader.result;
            previewImg.style.display = 'block';
            if (previewPlaceholder) previewPlaceholder.style.display = 'none';
          };
          reader.readAsDataURL(f);
        }
      });
      // wire visible browse button inside preview box to open file chooser
      const browseBtn = modalOverlay.querySelector('.browse-btn');
      if (browseBtn) {
        browseBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          try { fileInput.click(); } catch (e) { /* ignore */ }
        });
      }
    }
    uploadForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const formData = new FormData(uploadForm);
      const token = localStorage.getItem('token');
      const messageEl = modalOverlay.querySelector('.modal-message');
      if (!token) {
        if (messageEl) messageEl.textContent = 'Vous devez être connecté pour ajouter une photo.';
        return;
      }
      try {
        const res = await fetch('http://localhost:5678/api/works', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData
        });
        if (res.status === 201) {
          const newWork = await res.json();
          works.push(newWork);
          // update thumbnails and gallery
          const thumbs = modalOverlay.querySelector('.thumbnails');
          const item = document.createElement('div');
          item.className = 'thumb-item';
          item.dataset.id = newWork.id;
          const img = document.createElement('img');
          img.src = newWork.imageUrl;
          img.alt = newWork.title || '';
          item.appendChild(img);
          const del = document.createElement('button');
          del.type = 'button'; del.className = 'thumb-delete';
          del.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 6h18" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 11v6" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M14 11v6" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
          item.appendChild(del);
          thumbs.appendChild(item);
          // add to gallery
          const figure = document.createElement('figure');
          figure.dataset.id = newWork.id;
          const figImg = document.createElement('img'); figImg.src = newWork.imageUrl; figImg.alt = newWork.title || '';
          const figcap = document.createElement('figcaption'); figcap.textContent = newWork.title || '';
          figure.appendChild(figImg); figure.appendChild(figcap); gallery.appendChild(figure);
          if (messageEl) messageEl.textContent = 'Photo ajoutée.';
          uploadForm.reset();
          // restore preview placeholder after reset
          try {
            const previewImg = modalOverlay.querySelector('.preview-img');
            const previewPlaceholder = modalOverlay.querySelector('.preview-placeholder');
            if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
            if (previewPlaceholder) previewPlaceholder.style.display = 'flex';
          } catch (e) { /* ignore */ }
          // return to gallery view after successful upload
          try { showGalleryView(); } catch (e) { /* ignore */ }
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Erreur lors de l\'upload');
        }
      } catch (err) {
        console.error('Upload error', err);
        if (messageEl) messageEl.textContent = 'Erreur upload : ' + (err.message || 'erreur');
      }
    });
  }

  // --- Authentication-based UI updates ---
  function updateAuthUI() {
    try {
      const token = localStorage.getItem('token');
      const banner = document.getElementById('edit-banner');
      const authLink = document.getElementById('auth-link');
      const editBtnEl = document.getElementById('edit-projects-btn');
      if (token) {
        if (banner) {
          banner.classList.add('open');
          document.body.classList.add('has-edit-banner');
          document.body.classList.add('authenticated');
          banner.setAttribute('aria-hidden', 'false');
        }
        if (filtersContainer) filtersContainer.style.display = 'none';
        if (editBtnEl) editBtnEl.style.display = 'inline-block';

        if (authLink) {
          // update to logout
          authLink.textContent = 'logout';
          authLink.removeAttribute('href');
          // remove previous listeners by replacing node
          const newNode = authLink.cloneNode(true);
          authLink.parentNode.replaceChild(newNode, authLink);
          newNode.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            // hide banner immediately
            if (banner) {
              banner.classList.remove('open');
              banner.setAttribute('aria-hidden', 'true');
            }
            document.body.classList.remove('has-edit-banner');
            window.location.href = 'login.html';
          });
        }
      } else {
        if (banner) {
          banner.classList.remove('open');
          banner.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('has-edit-banner');
        document.body.classList.remove('authenticated');
        if (filtersContainer) filtersContainer.style.display = '';
        if (editBtnEl) editBtnEl.style.display = 'none';

        if (authLink) {
          // restore to login link
          const parent = authLink.parentNode;
          const newA = document.createElement('a');
          newA.id = 'auth-link';
          newA.href = 'login.html';
          newA.textContent = 'login';
          parent.replaceChild(newA, authLink);
        }
      }
    } catch (e) {
      console.error('updateAuthUI error', e);
    }
  }

  // initialize auth UI on load
  updateAuthUI();

}
/* ---------- Login form handling ---------- */
const loginForm = document.querySelector('.login form');
if (loginForm) {
  // Ensure an area for error messages
  let errorBox = document.querySelector('.login .login-error');
  if (!errorBox) {
    errorBox = document.createElement('div');
    errorBox.className = 'login-error';
    errorBox.style.color = '#b00020';
    errorBox.style.marginTop = '12px';
    errorBox.style.textAlign = 'center';
    errorBox.style.display = 'none';
    // accessibility
    errorBox.setAttribute('role', 'alert');
    errorBox.setAttribute('aria-live', 'assertive');
    loginForm.parentNode.appendChild(errorBox);
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';
    errorBox.style.display = 'none';

    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;

    // helper to focus a field inside the login form
    function focusField(selector) {
      try {
        const el = loginForm.querySelector(selector);
        if (el) {
          el.focus();
          if (typeof el.select === 'function') el.select();
        }
      } catch (e) { /* ignore */ }
    }

    if (!email || !password) {
      errorBox.textContent = 'Veuillez renseigner votre e‑mail et votre mot de passe.';
      errorBox.style.display = 'block';
      // focus first missing field
      if (!email) focusField('input[type="email"]');
      else focusField('input[type="password"]');
      return;
    }

    try {
      const res = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
        }
        errorBox.textContent = '';
        errorBox.style.display = 'none';
        window.location.href = 'index.html';
        return;
      }

      if (res.status === 401) {
        errorBox.textContent = 'Identifiants incorrects. Veuillez réessayer.';
        errorBox.style.display = 'block';
        // wrong password: clear and focus password
        const pwd = loginForm.querySelector('input[type="password"]');
        if (pwd) { pwd.value = ''; }
        focusField('input[type="password"]');
      } else if (res.status === 404) {
        errorBox.textContent = 'Utilisateur non trouvé.';
        errorBox.style.display = 'block';
        // unknown user: focus email
        focusField('input[type="email"]');
      } else {
        const err = await res.json().catch(()=> ({}));
        errorBox.textContent = err.message || 'Erreur lors de la connexion. Réessayez plus tard.';
        errorBox.style.display = 'block';
        focusField('input[type="email"]');
      }
    } catch (err) {
      console.error('Login error', err);
      errorBox.textContent = 'Impossible de joindre le serveur. Vérifiez que le backend tourne (http://localhost:5678).';
      errorBox.style.display = 'block';
      focusField('input[type="email"]');
    }
  });
}

const storedToken = localStorage.getItem('token');
if (storedToken) console.log('TOKEN :', storedToken);