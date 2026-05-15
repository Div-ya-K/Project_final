import BhindiMasala  from '../assets/menu/BhindiMasala.png'
import DalKhichdi    from '../assets/menu/DalKhichdi.png'
import Dhokla        from '../assets/menu/Dhokla.png'
import FriedRice     from '../assets/menu/FriedRice.png'
import HakkaNoodles  from '../assets/menu/HakkaNoodles.png'
import MasalaDosa    from '../assets/menu/MasalaDosa.png'
import MatarPaneer   from '../assets/menu/MatarPaneer.png'
import MeduVada      from '../assets/menu/MeduVada.png'
import Misal         from '../assets/menu/Misal.png'
import PavBhaji      from '../assets/menu/PavBhaji.png'
import Poha          from '../assets/menu/Poha.png'
import SabudanaVada  from '../assets/menu/SabudanaVada.png'
import Samosa        from '../assets/menu/Samosa.png'
import SamosaChaat   from '../assets/menu/SamosaChaat.png'
import Sandwich      from '../assets/menu/Sandwich.png'
import SchezwanRice  from '../assets/menu/SchezwanRice.png'
import Uttappa       from '../assets/menu/Uttappa.png'
import VadaPav       from '../assets/menu/VadaPav.png'
import VegBiryani    from '../assets/menu/VegBiryani.png'

// Maps the menu item name (must match exactly what's in MongoDB) to its image
export const MENU_IMAGES = {
  'Masala Dosa':    MasalaDosa,
  'Poha':           Poha,
  'Medu Vada':      MeduVada,
  'Uttappa':        Uttappa,
  'Dhokla':         Dhokla,
  'Sabudana Vada':  SabudanaVada,
  'Dal Khichdi':    DalKhichdi,
  'Matar Paneer':   MatarPaneer,
  'Bhindi Masala':  BhindiMasala,
  'Veg Biryani':    VegBiryani,
  'Misal Pav':      Misal,
  'Pav Bhaji':      PavBhaji,
  'Samosa':         Samosa,
  'Samosa Chaat':   SamosaChaat,
  'Vada Pav':       VadaPav,
  'Sandwich':       Sandwich,
  'Schezwan Rice':  SchezwanRice,
  'Hakka Noodles':  HakkaNoodles,
  'Fried Rice':     FriedRice,
}

// Helper — returns the image for an item, or a fallback placeholder
export const getMenuImage = (name) =>
  MENU_IMAGES[name] ?? `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`