/**
 * Report Page Controller
 * Protected page: handles full-screen report intake with canvas image compression.
 */
import { api } from './api.js';
import { initApp, resizeImageToDataUrl } from './common.js';

let resizedDataUrl = '';

async function init() {
  const user = await initApp({ requireLogin: true });
  if (!user) return;

  // Check URL type query
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  if (typeParam === 'found') {
    document.getElementById('typeFoundRadio').checked = true;
  }

  // Image input listener
  const imageInput = document.getElementById('itemImageFile');
  const previewBox = document.getElementById('imagePreviewBox');
  const previewImg = document.getElementById('imagePreviewEl');

  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        resizedDataUrl = await resizeImageToDataUrl(file);
        previewImg.src = resizedDataUrl;
        previewBox.style.display = 'block';
      } catch (err) {
        alert(err.message);
        imageInput.value = '';
        previewBox.style.display = 'none';
        resizedDataUrl = '';
      }
    }
  });

  // Form submit
  const form = document.getElementById('pageReportForm');
  const alertBox = document.getElementById('pageReportAlert');
  const submitBtn = document.getElementById('submitReportBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.style.display = 'none';

    const type = document.querySelector('input[name="pageReportType"]:checked')?.value || 'lost';
    const title = document.getElementById('itemTitle').value.trim();
    const category = document.getElementById('itemCategory').value;
    const zone = document.getElementById('itemZone').value;
    const location = document.getElementById('itemLocation').value.trim();
    const description = document.getElementById('itemDescription').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const res = await api.createItem({
        type,
        title,
        category,
        zone,
        location,
        description,
        image: resizedDataUrl
      });

      // Redirect to smart matches breakdown for this item
      window.location.href = `/matches.html?id=${encodeURIComponent(res.item.id)}`;
    } catch (err) {
      alertBox.textContent = err.message || 'Failed to submit report.';
      alertBox.style.display = 'flex';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Item Report';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

