import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

// Firebase Authentication, Firestore e Storage
const storage = getStorage(window.firebase.app);
const db = window.firebase.db;

// Login do administrador
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target[0].value;
  const password = e.target[1].value;

  try {
    const userCredential = await signInWithEmailAndPassword(window.firebase.auth, email, password);
    window.location.href = "dashboard.html"; // Redireciona para o painel de administração
  } catch (error) {
    alert("Erro de autenticação: " + error.message);
  }
});

// Formulário de novo projeto
const projectForm = document.getElementById('new-project-form');
const projectList = document.getElementById('project-list');

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const projectTitle = e.target[0].value; // Título do projeto
  const projectImage = e.target[1].files[0]; // Imagem do projeto

  if (!projectImage) {
    alert("Por favor, selecione uma imagem para o projeto.");
    return;
  }

  // Referência para o arquivo no Firebase Storage
  const storageRef = ref(storage, `projects/${projectImage.name}`);
  const uploadTask = uploadBytesResumable(storageRef, projectImage);

  // Acompanhar o progresso do upload
  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload está ' + progress + '% completo');
    }, 
    (error) => {
      console.error("Erro ao fazer upload da imagem: ", error);
    }, 
    async () => {
      // Upload concluído, obter URL da imagem
      const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

      // Salvar o projeto com a URL da imagem no Firestore
      try {
        await addDoc(collection(db, "projects"), {
          title: projectTitle,
          imageUrl: imageUrl
        });

        alert("Projeto adicionado com sucesso!");
        e.target.reset(); // Limpar o formulário
        listProjects(); // Atualizar a lista de projetos
      } catch (error) {
        console.error("Erro ao adicionar projeto: ", error);
      }
    }
  );
});

// Função para listar os projetos no painel
async function listProjects() {
  projectList.innerHTML = ''; // Limpar a lista existente
  const querySnapshot = await getDocs(collection(db, "projects"));
  
  querySnapshot.forEach((doc) => {
    const project = doc.data();
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <strong>${project.title}</strong>
      <img src="${project.imageUrl}" alt="${project.title}" style="width: 100px; height: auto;">
    `;
    projectList.appendChild(listItem);
  });
}

// Chamar a função de listar projetos ao carregar o painel
listProjects();
