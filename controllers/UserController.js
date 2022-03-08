class UserController {

  constructor(formIdCreate, formIdUpdate, tableId) {

    // formulario de incluir
    this.formCreateEl = document.getElementById(formIdCreate);
    
    // formulario de atualizacao
    this.formUpdateEl = document.getElementById(formIdUpdate);
    
    // tabela de dados
    this.tableEl = document.getElementById(tableId);

    // area de criar usuario
    this.boxUserCreate = document.querySelector("#box-user-create");
   
    // area de atualizar o usuario   
    this.boxUserUpdate = document.querySelector("#box-user-update");
    
    // botao de atualizar formulario
    this.updateButton = this.formUpdateEl.querySelector("[type=submit]");
    
    // botao de criar usuario
    this.createButton = this.formCreateEl.querySelector("[type=submit]");

    // botao cancelar atualizacao
    this.buttonCancelUpdate = document.querySelector("#box-user-update .btn-cancel");

    // o modo - create ou update
    this.mode = 'create';

    // define a acao de incluir
    this.onCreate();

    // define a acao de atualizacao
    this.onUpdate();
  }


  onUpdate() {

    // adiciona eventListener click no buttonCancelUpdate
    this.buttonCancelUpdate.addEventListener("click", e => {

      this.showPanelCreate();

    });

    // adiciona eventListener submit no formUpdateEl
    this.formUpdateEl.addEventListener("submit", event => {

      event.preventDefault();

      let btn = this.updateButton;

      btn.disabled = true;

      let values = this.getValues(this.formUpdateEl);

      let index = this.formUpdateEl.dataset.trIndex;

      let tr = this.tableEl.rows[index];

      tr.dataset.user = JSON.stringify(values);

      tr.innerHTML = `

           <td><img src="${values.photo}" alt="User Image" class="img-circle img-sm"></td>
           <td>${values.name}</td>
           <td>${values.email}</td>
           <td>${(values.admin) ? 'Sim2' : 'Não'}</td>
           <td>${Utils.dateFormat(values.register)}</td>
           <td>
             <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
             <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
           </td>
       `;

      this.addEventsTr(tr);

      this.updateCount();

    });

  }

  onCreate(formCreateEl) {

    this.formCreateEl.addEventListener("submit", event => {
      event.preventDefault();

      let btn = this.createButton;

      btn.disabled = true;

      let values = this.getValues(this.formCreateEl);

      if (!values) return false;

      this.getPhoto().then(
        (content) => {

          values.photo = content;

          this.addLine(values);

          this.formCreateEl.reset();

          btn.disabled = false;

        },
        (e) => {
          console.error(e);
        });
    }
    );


  }

  getPhoto() {

    return new Promise((resolve, reject) => {

      let fileReader = new FileReader();

      const formElements = this.mode == 'create'?[...this.formCreateEl.elements]:[...this.formUpdateEl.elements];

      let elements = formElements.filter(item => {

        if (item.name === 'photo') {
          return item;
        }

      });

      let file = elements[0].files[0];

      fileReader.onload = () => {

        resolve(fileReader.result);

      };

      fileReader.onerror = (e) => {

        reject(e)

      }

      if (file) {
        fileReader.readAsDataURL(file);

      } else {
        resolve('dist/img/boxed-bg.jpg');
      }

    });

  }

  getValues(formCreateEl) {

    let user = {};
    let isValid = true;

    [...formCreateEl.elements].forEach(function (field, index) {

      if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {

        field.parentElement.classList.add('has-error');
        isValid = false;

      }

      if (field.name == "gender") {

        if (field.checked) {
          user[field.name] = field.value;

        }

      } else if (field.name == "admin") {

        user[field.name] = field.checked;

      } else {

        user[field.name] = field.value;

      }

    });

    if (!isValid) {
      return false;
    }

    return new User(
      user.name,
      user.gender,
      user.birth,
      user.country,
      user.email,
      user.password,
      user.photo,
      user.admin
    );

  }

  addLine(dataUser) {

    let tr = document.createElement('tr');

    tr.dataset.user = JSON.stringify(dataUser);

    tr.innerHTML = `
           <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
           <td>${dataUser.name}</td>
           <td>${dataUser.email}</td>
           <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
           <td>${Utils.dateFormat(dataUser.register)}</td>
           <td>
             <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
             <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
           </td>
       `;

    this.addEventsTr(tr);

    this.tableEl.appendChild(tr);

    this.updateCount();

  }

  addEventsTr(tr) {

    tr.querySelector(".btn-edit").addEventListener("click", e => {

      let json = JSON.parse(tr.dataset.user);
      let form = document.querySelector("#form-user-update");

      form.dataset.trIndex = tr.sectionRowIndex;

      for (let name in json) {

        let field = form.querySelector("[name=" + name.replace("_", "") + "]");

        if (field) {

          switch (field.type) {
            case 'file':
              continue;
              break;

            case 'radio':
              field = form.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
              field.checked = true;
              break;

            case 'checkbox':
              field.checked = json[name];
              break;

            default:
              field.value = json[name];

          }

        }

      }

      this.showPanelUpdate();

    });

  }

  // exibe o painel de criacao
  showPanelCreate() {
    
    // exibe a area de criacao
    this.boxUserCreate.style.display = "block";
    
    // oculta a area de atualizacao
    this.boxUserUpdate.style.display = "none";
    
    // define o modo como create
    this.mode = 'create';
  }

  // exibe o painel de atualizacao
  showPanelUpdate() {

    // oculta a area de criacao
    this.boxUserCreate.style.display = "none";
    
    // exibe a area de atualizacao
    this.boxUserUpdate.style.display = "block";
    
    // define o modo como update
    this.mode = 'update';
  }

  updateCount() {

    let numberUsers = 0;
    let numberAdmin = 0;

    [...this.tableEl.children].forEach(tr => {

      numberUsers++;

      let user = JSON.parse(tr.dataset.user);

      if (user._admin) numberAdmin++;

    });


    document.querySelector("#number-users").innerHTML = numberUsers;
    document.querySelector("#number-users-admin").innerHTML = numberAdmin;

  }

}