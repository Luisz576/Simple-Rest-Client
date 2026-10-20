const iconWrapper = document.querySelector('.icon-wrapper')
const urlTooltip = document.getElementById('urlTooltip')

const queryIconWrapper = document.querySelector('#querySection .icon-wrapper')
const queryTooltip = document.getElementById('queryTooltip')

const headersIconWrapper = document.querySelector('#headersSection .icon-wrapper')
const headersTooltip = document.getElementById('headersTooltip')

const cookieIconWrapper = document.querySelector('#authSection .icon-wrapper')
const cookieTooltip = document.getElementById('cookieTooltip')

function hideTooltip(tooltip) {
    tooltip.style.display = 'none'
}

function positionTooltip(tooltip, iconEl) {
    tooltip.style.display = 'block'
    const wrapperRect = iconEl.closest('.icon-wrapper').getBoundingClientRect()
    const rect = iconEl.getBoundingClientRect()
    const tipWidth = tooltip.offsetWidth
    const tipHeight = tooltip.offsetHeight
    const top = rect.top - wrapperRect.top + rect.height / 2 - tipHeight / 2
    let left = rect.right - wrapperRect.left + 10
    if (left + tipWidth > wrapperRect.width) {
        left = rect.left - wrapperRect.left - tipWidth - 10
    }
    if (left < 0) {
        left = rect.right - wrapperRect.left + 10
    }
    if (top < 0) {
        tooltip.style.top = (rect.bottom - wrapperRect.top + 10) + 'px'
    } else {
        tooltip.style.top = top + 'px'
    }
    tooltip.style.left = left + 'px'
    tooltip.style.margin = '0'
    tooltip.style.transform = 'none'
}

function showTooltip(tooltip, iconEl) {
    positionTooltip(tooltip, iconEl)
    tooltip.style.display = 'block'
}

// URL tooltip
if (iconWrapper && urlTooltip) {
    hideTooltip(urlTooltip)
    iconWrapper.addEventListener('mouseenter', () => showTooltip(urlTooltip, iconWrapper))
    iconWrapper.addEventListener('mouseleave', () => hideTooltip(urlTooltip))
}

// Query Parameters tooltip
if (queryIconWrapper && queryTooltip) {
    hideTooltip(queryTooltip)
    queryIconWrapper.addEventListener('mouseenter', () => showTooltip(queryTooltip, queryIconWrapper))
    queryIconWrapper.addEventListener('mouseleave', () => hideTooltip(queryTooltip))
}

// Headers tooltip
if (headersIconWrapper && headersTooltip) {
    hideTooltip(headersTooltip)
    headersIconWrapper.addEventListener('mouseenter', () => showTooltip(headersTooltip, headersIconWrapper))
    headersIconWrapper.addEventListener('mouseleave', () => hideTooltip(headersTooltip))
}

// Cookie tooltip

if (cookieIconWrapper && cookieTooltip) {
    hideTooltip(cookieTooltip)
    cookieIconWrapper.addEventListener('mouseenter', () => showTooltip(cookieTooltip, cookieIconWrapper))
    cookieIconWrapper.addEventListener('mouseleave', () => hideTooltip(cookieTooltip))
}