document.addEventListener("DOMContentLoaded", function () {
  const createCupBtn = document.querySelector('.create-cup');
  const myCupsBtn = document.querySelector('.my-cups');
  const allCupsBtn = document.querySelector('.all-cup');
  const modal = document.getElementById('createCupModal');
  const modalContent = document.getElementById('modalContent');
  const cupsContainer = document.querySelector('.part-left');
  const totalVolumeElement = document.querySelector('.total-volume-numb');
  const countBtn = document.querySelector('.count-btn');
  const sortCheckbox = document.querySelector('.switch input');
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');
  const cancelBtn = document.querySelector('.cancel-btn');

  let initialCupsOrder = [];
  let newCups = [];
  let allCups = Array.from(cupsContainer.children);

  // модальнe вікно"Create Cup"
  function loadCreateCupModal() {
    fetch('createCup.html')
      .then(response => response.text())
      .then(data => {
        modalContent.innerHTML = data;
        modal.style.display = 'block';

        const createBtn = modalContent.querySelector('#createBtn');
        createBtn.addEventListener('click', createNewCup);

        const closeBtn = modalContent.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      })
      .catch(error => console.error('Error loading modal:', error));
  }

  // створення нової чашки
  function createNewCup() {
    const cupName = modalContent.querySelector('#cupName').value;
    const cupVolume = modalContent.querySelector('#cupVolume').value;
    const cupMaterial = modalContent.querySelector('#cupMaterial').value;
    const cupColor = modalContent.querySelector('#cupColor').value;

    if (cupName && cupVolume && cupMaterial && cupColor) {
      const newCup = {
        name: cupName,
        volume: parseInt(cupVolume),
        material: cupMaterial,
        color: cupColor
      };

      saveCupToLocalStorage(newCup);
      displayNewCup(newCup);
      newCups.push(newCup);
      modal.style.display = 'none';
      updateInitialCupsOrder();
    } else {
      alert('Please fill in all fields.');
    }
  }

 
  function saveCupToLocalStorage(cup) {
    let cups = JSON.parse(localStorage.getItem('cups')) || [];
    cups.push(cup);
    localStorage.setItem('cups', JSON.stringify(cups));
  }

  
  function displayNewCup(cup) {
    const newCupElement = document.createElement("div");
    newCupElement.classList.add('cup-item');
    newCupElement.innerHTML = `
      <img src="../img/whitee.jpg" alt="cup1" class="cup-image">
      <p class="cup-name">${cup.name}</p>
      <p class="cup-volume">Volume: ${cup.volume}</p>
      <p class="cup-material">Material: ${cup.material}</p>
      <p class="cup-color">Color: ${cup.color}</p>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;
    cupsContainer.appendChild(newCupElement);

    //  Delete
    newCupElement.querySelector('.delete-btn').addEventListener('click', function () {
      deleteCup(newCupElement, cup.name);
    });

    // Edit
    newCupElement.querySelector('.edit-btn').addEventListener('click', function () {
      loadEditCupModal(newCupElement);
    });

    updateInitialCupsOrder();
  }

  //видалення чашки
  function deleteCup(cupElement, cupName) {
    cupElement.remove();
    removeCupFromLocalStorage(cupName);
    updateInitialCupsOrder();
  }

  
  function removeCupFromLocalStorage(cupName) {
    let cups = JSON.parse(localStorage.getItem('cups')) || [];
    cups = cups.filter(cup => cup.name !== cupName);
    localStorage.setItem('cups', JSON.stringify(cups));
  }

 
  function updateInitialCupsOrder() {
    initialCupsOrder = Array.from(cupsContainer.children);
  }

  // Завантаження чашок з LocalStorage при завантаженні сторінки
  function loadCupsFromLocalStorage() {
    const cups = JSON.parse(localStorage.getItem('cups')) || [];
    cups.forEach(cup => {
      displayNewCup(cup);
    });
    updateInitialCupsOrder();
  }

  // підрахунок об'єму всіх чашок
  function calculateTotalVolume() {
    let totalVolume = 0;
    const cupVolumes = document.querySelectorAll('.cup-volume');
    cupVolumes.forEach(volumeElement => {
      const volumeText = volumeElement.textContent.replace('Volume: ', '');
      const volume = parseInt(volumeText);
      totalVolume += volume;
    });
    totalVolumeElement.textContent = totalVolume;
  }

  //сортування чашок за об'ємом
  function sortCupsByVolume(ascending = true) {
    const cups = Array.from(cupsContainer.children).filter(cup => cup.style.display !== 'none');
    cups.sort((a, b) => {
      const volumeA = parseInt(a.querySelector('.cup-volume').textContent.replace('Volume: ', ''));
      const volumeB = parseInt(b.querySelector('.cup-volume').textContent.replace('Volume: ', ''));
      return ascending ? volumeA - volumeB : volumeB - volumeA;
    });

    cupsContainer.innerHTML = '';
    cups.forEach(cup => cupsContainer.appendChild(cup));
  }

  //кн Count
  countBtn.addEventListener('click', calculateTotalVolume);

 


  sortCheckbox.addEventListener('change', function () {
    if (this.checked) {
      sortCupsByVolume(true);
    } else {
      cupsContainer.innerHTML = '';
      initialCupsOrder.forEach(cupElement => {
        cupsContainer.appendChild(cupElement);
      });
    }
  });

  // модальне вікно Create Cup
  createCupBtn.addEventListener('click', loadCreateCupModal);

  loadCupsFromLocalStorage();

 // модальне вікно edit Cup
  function loadEditCupModal(cupElement) {
    fetch('editCup.html')
      .then(response => response.text())
      .then(data => {
        modalContent.innerHTML = data;
        modal.style.display = 'block';

        const cupNameField = modalContent.querySelector('#editcupName');
        const cupVolumeField = modalContent.querySelector('#editcupVolume');
        const cupMaterialField = modalContent.querySelector('#editcupMaterial');
        const cupColorField = modalContent.querySelector('#editcupColor');
        const cupImageInput = modalContent.querySelector('#editcupImage'); 

       
        cupNameField.value = cupElement.querySelector('.cup-name').textContent;
        cupVolumeField.value = cupElement.querySelector('.cup-volume').textContent.replace('Volume: ', '');
        cupMaterialField.value = cupElement.querySelector('.cup-material').textContent.replace('Material: ', '');
        cupColorField.value = cupElement.querySelector('.cup-color').textContent;

        const editBtn = modalContent.querySelector('#editcreateBtn');
        editBtn.addEventListener('click', function() {
          // Оновлення даних чашки
          saveEditedCup(cupElement, {
            name: cupNameField.value,
            volume: parseInt(cupVolumeField.value),
            material: cupMaterialField.value,
            color: cupColorField.value
          });

          // Якщо вибране нове зображення, оновити його
          if (cupImageInput.files && cupImageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
              cupElement.querySelector('.cup-image').src = e.target.result; 
            };
            reader.readAsDataURL(cupImageInput.files[0]); 
          }

          modal.style.display = 'none';
        });

        const closeBtn = modalContent.querySelector('.editclose-btn');
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      })
      .catch(error => console.error('Error loading modal:', error));
  }

  //збереження зміненої чашки
  function saveEditedCup(cupElement, editedCup) {
    cupElement.querySelector('.cup-name').textContent = editedCup.name;
    cupElement.querySelector('.cup-volume').textContent = 'Volume: ' + editedCup.volume;
    cupElement.querySelector('.cup-material').textContent = 'Material: ' + editedCup.material;
    cupElement.querySelector('.cup-color').textContent = 'Color: ' + editedCup.color;

    let cups = JSON.parse(localStorage.getItem('cups')) || [];
    cups = cups.map(cup => {
      if (cup.name === cupElement.querySelector('.cup-name').textContent) {
        return editedCup;
      }
      return cup;
    });
    localStorage.setItem('cups', JSON.stringify(cups));
  }

  cupsContainer.addEventListener('click', function(event) {
    if (event.target.classList.contains('edit-btn')) {
      const cupElement = event.target.closest('.cup-item');
      loadEditCupModal(cupElement);
    }
  });

  // Пошук
  function searchCups() {
    const searchTerm = searchInput.value.toLowerCase();
    const cupItems = cupsContainer.querySelectorAll('.cup-item');

    cupItems.forEach(cupItem => {
      const cupName = cupItem.querySelector('.cup-name').textContent.toLowerCase();
      const cupVolume = cupItem.querySelector('.cup-volume').textContent.toLowerCase();
      const cupMaterial = cupItem.querySelector('.cup-material').textContent.toLowerCase();
      const cupColor = cupItem.querySelector('.cup-color').textContent.toLowerCase();

      if (cupName.includes(searchTerm) ||
          cupVolume.includes(searchTerm) ||
          cupMaterial.includes(searchTerm) ||
          cupColor.includes(searchTerm)) {
        cupItem.style.display = 'block';
      } else {
        cupItem.style.display = 'none';
      }
    });
  }

  //Cansle
  function cancelSearch() {
    searchInput.value = '';
    const cupItems = cupsContainer.querySelectorAll('.cup-item');
    cupItems.forEach(cupItem => {
      cupItem.style.display = 'block';
    });
  }

 

  searchBtn.addEventListener('click', searchCups);

  cancelBtn.addEventListener('click', cancelSearch);

  // My Cup
  function showMyCups() {
    const createdCups = newCups.map(cup => cup.name);
    allCups.forEach(cup => {
      const cupName = cup.querySelector('.cup-name').textContent;
      if (createdCups.includes(cupName)) {
        cup.style.display = 'block';
      } else {
        cup.style.display = 'none';
      }
    });
  }

  // Показ усіх чашок
  function showAllCups() {
    allCups.forEach(cup => {
      cup.style.display = 'block';
      modal.style.display= "none";
    });
  }

 //My Cups
  myCupsBtn.addEventListener('click', showMyCups);

  // All Cups
  allCupsBtn.addEventListener('click', showAllCups);
 
});

