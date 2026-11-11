/**
 * My Claims Page Controller
 * Protected page: displays submitted claims & received claims with approve/reject actions.
 */
import { api } from './api.js';
import { initApp, timeAgo } from './common.js';

let submittedClaims = [];
let receivedClaims = [];
let activeTab = 'submitted';

async function init() {
  const user = await initApp({ requireLogin: true });
  if (!user) return;

  const tabs = document.querySelectorAll('.claims-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      renderClaims();
    });
  });

  await loadClaims();
}

async function loadClaims() {
  const loading = document.getElementById('claimsLoading');

  try {
    const res = await api.getClaims();
    submittedClaims = res.submitted || [];
    receivedClaims = res.received || [];

    document.getElementById('submittedTabBtn').textContent = `Claims I Submitted (${submittedClaims.length})`;
    document.getElementById('receivedTabBtn').textContent = `Claims Received on My Items (${receivedClaims.length})`;

    loading.style.display = 'none';
    renderClaims();
  } catch (err) {
    loading.innerHTML = `<p style="color: var(--error);">Error loading claims: ${err.message}</p>`;
  }
}

function renderClaims() {
  const list = document.getElementById('claimsList');
  const empty = document.getElementById('claimsEmpty');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptyDesc = document.getElementById('emptyDesc');

  const claims = activeTab === 'submitted' ? submittedClaims : receivedClaims;
  list.innerHTML = '';

  if (claims.length === 0) {
    list.style.display = 'none';
    empty.style.display = 'block';

    if (activeTab === 'submitted') {
      emptyTitle.textContent = 'No Claims Submitted';
      emptyDesc.textContent = "You haven't submitted ownership claims on any found items yet.";
    } else {
      emptyTitle.textContent = 'No Claims Received';
      emptyDesc.textContent = "None of your reported found items have pending or reviewed claims.";
    }
  } else {
    empty.style.display = 'none';
    list.style.display = 'flex';

    claims.forEach((claim) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.padding = '1.25rem';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '0.75rem';

      // Top row
      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.justifyContent = 'space-between';
      topRow.style.alignItems = 'flex-start';
      topRow.style.flexWrap = 'wrap';
      topRow.style.gap = '0.5rem';

      const leftCol = document.createElement('div');
      const claimIdSpan = document.createElement('span');
      claimIdSpan.style.fontSize = '0.625rem';
      claimIdSpan.style.color = 'var(--outline)';
      claimIdSpan.style.textTransform = 'uppercase';
      claimIdSpan.style.fontWeight = '700';
      claimIdSpan.textContent = `Claim ID #${claim.id}`;
      leftCol.appendChild(claimIdSpan);

      const titleLink = document.createElement('a');
      titleLink.href = `/item.html?id=${encodeURIComponent(claim.itemId)}`;
      const titleH3 = document.createElement('h3');
      titleH3.style.fontSize = '1.125rem';
      titleH3.style.marginTop = '0.25rem';
      titleH3.textContent = claim.itemTitle || 'Campus Item';
      titleLink.appendChild(titleH3);
      leftCol.appendChild(titleLink);

      const metaP = document.createElement('p');
      metaP.style.fontSize = '0.75rem';
      metaP.style.color = 'var(--on-surface-variant)';
      metaP.textContent = `${claim.itemLocation || 'Campus location'} • Submitted ${timeAgo(claim.createdAt)}`;
      leftCol.appendChild(metaP);

      topRow.appendChild(leftCol);

      // Status Badge
      const statusBadge = document.createElement('span');
      statusBadge.className = `badge badge-${claim.status}`;
      statusBadge.textContent = claim.status.toUpperCase();
      topRow.appendChild(statusBadge);

      card.appendChild(topRow);

      // Proof box
      const proofBox = document.createElement('div');
      proofBox.style.background = 'var(--surface-container-low)';
      proofBox.style.border = '1px solid var(--outline-variant)';
      proofBox.style.borderRadius = 'var(--radius-md)';
      proofBox.style.padding = '0.75rem';
      proofBox.style.fontSize = '0.75rem';

      const proofLabel = document.createElement('strong');
      proofLabel.style.display = 'block';
      proofLabel.style.marginBottom = '0.25rem';
      proofLabel.textContent = activeTab === 'submitted' ? 'Your Submitted Ownership Proof:' : `Claimant (@${claim.claimantUsername}) Stated Proof:`;
      proofBox.appendChild(proofLabel);

      const proofText = document.createElement('p');
      proofText.style.color = 'var(--on-surface-variant)';
      proofText.style.lineHeight = '1.5';
      proofText.textContent = claim.proofDescription;
      proofBox.appendChild(proofText);

      card.appendChild(proofBox);

      // Reviewer notes if any
      if (claim.reviewerNotes) {
        const notesBox = document.createElement('div');
        notesBox.className = 'alert alert-info';
        notesBox.style.margin = '0';
        notesBox.style.padding = '0.5rem 0.75rem';
        const noteText = document.createElement('span');
        noteText.textContent = `Reviewer Note: ${claim.reviewerNotes}`;
        notesBox.appendChild(noteText);
        card.appendChild(notesBox);
      }

      // If activeTab is 'received' and user is the owner, allow Approve / Reject
      if (activeTab === 'received') {
        const actionRow = document.createElement('div');
        actionRow.style.display = 'flex';
        actionRow.style.justifyContent = 'flex-end';
        actionRow.style.gap = '0.5rem';
        actionRow.style.paddingTop = '0.5rem';
        actionRow.style.borderTop = '1px solid var(--outline-variant)';

        if (claim.status !== 'approved') {
          const approveBtn = document.createElement('button');
          approveBtn.className = 'btn btn-found btn-sm';
          approveBtn.textContent = 'Approve Claim';
          approveBtn.addEventListener('click', async () => {
            const note = prompt('Optional pickup / verification instructions for claimant:', 'Ownership verified. You can pick it up at the security desk.');
            if (note !== null) {
              try {
                await api.updateClaim(claim.id, { status: 'approved', reviewerNotes: note });
                await loadClaims();
              } catch (err) {
                alert('Failed to approve claim: ' + err.message);
              }
            }
          });
          actionRow.appendChild(approveBtn);
        }

        if (claim.status !== 'rejected') {
          const rejectBtn = document.createElement('button');
          rejectBtn.className = 'btn btn-danger btn-sm';
          rejectBtn.textContent = 'Reject Claim';
          rejectBtn.addEventListener('click', async () => {
            const note = prompt('Reason for rejection:', 'Insufficient proof provided.');
            if (note !== null) {
              try {
                await api.updateClaim(claim.id, { status: 'rejected', reviewerNotes: note });
                await loadClaims();
              } catch (err) {
                alert('Failed to reject claim: ' + err.message);
              }
            }
          });
          actionRow.appendChild(rejectBtn);
        }

        card.appendChild(actionRow);
      }

      list.appendChild(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
