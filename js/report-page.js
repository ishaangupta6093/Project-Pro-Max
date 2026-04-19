// =========================================
// ProofPlate — report-page.js
// =========================================

function getQueryParam(p) {
  return new URLSearchParams(window.location.search).get(p);
}

document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill restaurant name if linked from restaurant page
  const id = getQueryParam('id');
  if (id) {
    const r = getRestaurantById(id);
    if (r) {
      document.getElementById('forRestaurant').textContent = r.name;
    }
  }

  // Char counter
  const desc  = document.getElementById('descInput');
  const count = document.getElementById('charCount');
  desc.addEventListener('input', () => {
    count.textContent = desc.value.length;
  });

  // Photo preview
  document.getElementById('reportPhoto').addEventListener('change', previewReportPhoto);

  // Drag & drop
  const area = document.getElementById('reportUploadArea');
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      document.getElementById('reportPhoto').files = dt.files;
      previewReportPhoto();
    }
  });

  // Issue chip fallback (for browsers without :has)
  document.querySelectorAll('.issue-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.issue-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });
});

function previewReportPhoto() {
  const file    = document.getElementById('reportPhoto').files[0];
  const preview = document.getElementById('reportPhotoPreview');
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function submitReport(e) {
  e.preventDefault();

  // Validate
  const issueType = document.querySelector('input[name="issueType"]:checked');
  const desc      = document.getElementById('descInput').value.trim();
  let valid = true;

  if (!issueType) {
    document.getElementById('issueError').textContent = 'Please select an issue type.';
    valid = false;
  } else {
    document.getElementById('issueError').textContent = '';
  }

  if (!desc) {
    document.getElementById('descError').textContent = 'Please describe what happened.';
    valid = false;
  } else {
    document.getElementById('descError').textContent = '';
  }

  if (!valid) return;

  // Simulate submission loading
  const btn  = document.getElementById('submitBtn');
  const text = document.getElementById('submitText');
  const spin = document.getElementById('submitSpinner');

  btn.disabled = true;
  text.textContent = 'Submitting…';
  spin.style.display = 'inline-block';

  setTimeout(() => {
    // Show success overlay
    document.getElementById('successOverlay').classList.add('visible');
    showToast('Report submitted successfully!', 'success');
  }, 1800);
}
