import HomePage from './pages/homepage';
import './style.css'
import Navigo from 'navigo'
const router = new Navigo('/');

const render = (view: () => string) => {
  const app = document.querySelector('#app');
  if (app) {
    app.innerHTML = view();
  }
}

router.on('/', function () {
  render(HomePage)
});


router.resolve()
