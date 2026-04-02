function toggleSidebar(){

document.querySelector('.sidebar').classList.toggle('active')
document.querySelector('.sidebar-overlay').classList.toggle('active')

}

function closeSidebar(){

document.querySelector('.sidebar').classList.remove('active')
document.querySelector('.sidebar-overlay').classList.remove('active')

}
