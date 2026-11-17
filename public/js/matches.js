/**
 * Smart Matches Page Controller
 * Displays ranked counter-items scored by the backend matching engine.
 */
import { api } from './api.js';
import { initApp, openClaimModal } from './common.js';

let targetItem = null;

async function init() {
  await initApp();

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    window.location.href = '/browse.html';
    return;
  }

  document.getElementById('backToItemLink').href = `/item.html?id=${encodeURIComponent(id)}`;

  await loadMatches(id);
}

async function loadMatches(id) {
  const loading = document.getElementById('matchesLoading');
  const content = document.getElementById('matchesContent');
  const list = document.getElementById('matchesList');
  const empty = document.getElementById('noMatchesEmpty');

  try {
    const res = await api.getItemMatches(id);
    targetItem = res.target;
    const matches = res.matches || [];

    loading.style.display = 'none';
    content.style.display = 'block';

    // Populate Target Card
    document.getElementById('targetTitle').textContent = targetItem.title;
    document.getElementById('targetMeta').textContent = `${targetItem.location} • ${targetItem.category}`;
    document.getElementById('targetTypeBadge').textContent = targetItem.type === 'lost' ? 'LOST' : 'FOUND';
    document.getElementById('targetTypeBadge').className = `badge ${targetItem.type === 'lost' ? 'badge-lost' : 'badge-found'}`;
    document.getElementById('targetImg').src = targetItem.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2264%22%20height%3D%2264%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22%23eceef3%22%2F%3E%3C%2Fsvg%3E';

    document.getElementById('matchCounterText').textContent = `${matches.length} Counter-${matches.length === 1 ? 'Match' : 'Matches'} Found`;

    list.innerHTML = '';

    if (matches.length === 0) {
      list.style.display = 'none';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      list.style.display = 'flex';

      matches.forEach(({ candidate, matchScore, reasons, overlappingWords }) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'card';
        itemCard.style.padding = '1.25rem';
        itemCard.style.display = 'flex';
        itemCard.style.flexDirection = 'column';
        itemCard.style.gap = '1rem';

        // Top info row
        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.justifyContent = 'space-between';
        topRow.style.alignItems = 'flex-start';
        topRow.style.flexWrap = 'wrap';
        topRow.style.gap = '0.75rem';

        const infoGroup = document.createElement('div');
        infoGroup.style.display = 'flex';
        infoGroup.style.gap = '1rem';

        const img = document.createElement('img');
        img.style.width = '72px';
        img.style.height = '72px';
        img.style.borderRadius = 'var(--radius-lg)';
        img.style.objectFit = 'cover';
        img.style.background = 'var(--surface-container)';
        img.src = candidate.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2272%22%20height%3D%2272%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Crect%20width%3D%2272%22%20height%3D%2272%22%20fill%3D%22%23eceef3%22%2F%3E%3C%2Fsvg%3E';
        infoGroup.appendChild(img);

        const textGroup = document.createElement('div');
        const badgeRow = document.createElement('div');
        badgeRow.style.display = 'flex';
        badgeRow.style.gap = '0.375rem';
        badgeRow.style.marginBottom = '0.25rem';

        const typeBadge = document.createElement('span');
        typeBadge.className = `badge ${candidate.type === 'found' ? 'badge-found' : 'badge-lost'}`;
        typeBadge.textContent = candidate.type === 'found' ? 'FOUND ITEM' : 'LOST ITEM';
        badgeRow.appendChild(typeBadge);
        textGroup.appendChild(badgeRow);

        const titleLink = document.createElement('a');
        titleLink.href = `/item.html?id=${encodeURIComponent(candidate.id)}`;
        const titleH4 = document.createElement('h4');
        titleH4.style.fontSize = '1rem';
        titleH4.textContent = candidate.title;
        titleLink.appendChild(titleH4);
        textGroup.appendChild(titleLink);

        const locP = document.createElement('p');
        locP.style.fontSize = '0.75rem';
        locP.style.color = 'var(--on-surface-variant)';
        locP.textContent = `${candidate.location} • ${candidate.category}`;
        textGroup.appendChild(locP);

        infoGroup.appendChild(textGroup);
        topRow.appendChild(infoGroup);

        // Score Badge
        const scoreBadge = document.createElement('div');
        scoreBadge.className = 'badge badge-match';
        scoreBadge.style.fontSize = '0.875rem';
        scoreBadge.style.padding = '0.375rem 0.75rem';
        scoreBadge.textContent = `${matchScore}% AI Match`;
        topRow.appendChild(scoreBadge);

        itemCard.appendChild(topRow);

        // Reasons breakdown
        const reasonsBox = document.createElement('div');
        reasonsBox.style.background = 'var(--surface-container-low)';
        reasonsBox.style.border = '1px solid var(--outline-variant)';
        reasonsBox.style.borderRadius = 'var(--radius-md)';
        reasonsBox.style.padding = '0.75rem';
        reasonsBox.style.fontSize = '0.75rem';

        const reasonsTitle = document.createElement('strong');
        reasonsTitle.style.display = 'block';
        reasonsTitle.style.marginBottom = '0.25rem';
        reasonsTitle.textContent = 'Match Factor Breakdown:';
        reasonsBox.appendChild(reasonsTitle);

        const reasonsUl = document.createElement('ul');
        reasonsUl.style.paddingLeft = '1.25rem';
        reasonsUl.style.color = 'var(--on-surface-variant)';
        reasons.forEach((reason) => {
          const li = document.createElement('li');
          li.textContent = reason;
          reasonsUl.appendChild(li);
        });
        reasonsBox.appendChild(reasonsUl);
        itemCard.appendChild(reasonsBox);

        // Action row
        const actionsRow = document.createElement('div');
        actionsRow.style.display = 'flex';
        actionsRow.style.justifyContent = 'flex-end';
        actionsRow.style.gap = '0.5rem';

        const detailsBtn = document.createElement('a');
        detailsBtn.href = `/item.html?id=${encodeURIComponent(candidate.id)}`;
        detailsBtn.className = 'btn btn-secondary btn-sm';
        detailsBtn.textContent = 'View Item Details';
        actionsRow.appendChild(detailsBtn);

        if (candidate.type === 'found' && candidate.status === 'active') {
          const claimBtn = document.createElement('button');
          claimBtn.className = 'btn btn-primary btn-sm';
          claimBtn.textContent = 'Claim This Found Item';
          claimBtn.addEventListener('click', () => openClaimModal(candidate));
          actionsRow.appendChild(claimBtn);
        }

        itemCard.appendChild(actionsRow);
        list.appendChild(itemCard);
      });
    }
  } catch (err) {
    loading.innerHTML = `<p style="color: var(--error);">Error loading smart matches: ${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);

