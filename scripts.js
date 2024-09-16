import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const projectSection = document.getElementById('projects-container');

async function listProjects() {
  const querySnapshot = await getDocs(collection(window.firebase.db, "projects"));

  querySnapshot.forEach((doc) => {
    const project = doc.data();
    const projectDiv = document.createElement('div');
    projectDiv.classList.add('project');
    projectDiv.innerHTML = `
      <img src="${project.imageUrl}" alt="${project.title}">
      <h3>${project.title}</h3>
    `;
    projectSection.appendChild(projectDiv);
  });
}

listProjects();
