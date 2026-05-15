// ─── Menu item images ─────────────────────────────────────────────────────────
// Images live in src/assets/menu/ — filenames match exactly as imported below.
// Supported formats: .png .jpg .jpeg .webp .avif

import BhindiMasala    from '../assets/menu/BhindiMasala.png'
import DalKhichdi      from '../assets/menu/DalKhichdi.png'
import Dhokla          from '../assets/menu/Dhokla.png'
import FriedRice       from '../assets/menu/FriedRice.png'
import HakkaNoodles    from '../assets/menu/HakkaNoodles.png'
import MasalaDosa      from '../assets/menu/MasalaDosa.png'
import MatarPaneer     from '../assets/menu/MatarPaneer.png'
import MeduVada        from '../assets/menu/MeduVada.png'
import Misal           from '../assets/menu/Misal.png'
import PavBhaji        from '../assets/menu/PavBhaji.png'
import Poha            from '../assets/menu/Poha.png'
import SabudanaVada    from '../assets/menu/SabudanaVada.png'
import Samosa          from '../assets/menu/Samosa.png'
import SamosaChaat     from '../assets/menu/SamosaChaat.png'
import Sandwich        from '../assets/menu/Sandwich.png'
import SchezwanRice    from '../assets/menu/SchezwanRice.png'
import Uttappa         from '../assets/menu/Uttappa.png'
import VadaPav         from '../assets/menu/VadaPav.png'
import VegBiryani      from '../assets/menu/VegBiryani.png'

export const MENU_ITEMS = [
  // ── Breakfast ──
  { id:1,  name:'Masala Dosa',      cat:'Breakfast', price:60,  cal:290, tags:['HIGH DEMAND','VEGAN'], img: MasalaDosa,   desc:'Crispy rice crepe served with coconut chutney and piping hot sambar' },
  { id:2,  name:'Poha',             cat:'Breakfast', price:40,  cal:210, tags:['LOW CALORIE','VEGAN'], img: Poha,         desc:'Flattened rice with mustard seeds, onions, green chilli and fresh coriander' },
  { id:3,  name:'Medu Vada',        cat:'Breakfast', price:50,  cal:260, tags:['HIGH DEMAND','VEGAN'], img: MeduVada,     desc:'Crispy urad dal fritters served with coconut chutney and sambar' },
  { id:4,  name:'Uttappa',          cat:'Breakfast', price:55,  cal:280, tags:['VEGAN'],               img: Uttappa,      desc:'Thick rice pancake topped with onions, tomatoes and green chillies' },
  { id:5,  name:'Dhokla',           cat:'Breakfast', price:45,  cal:190, tags:['LOW CALORIE','VEGAN'], img: Dhokla,       desc:'Soft steamed chickpea flour cake tempered with mustard and curry leaves' },
  { id:6,  name:'Sabudana Vada',    cat:'Breakfast', price:50,  cal:300, tags:['VEGAN'],               img: SabudanaVada, desc:'Crispy tapioca pearl patties with peanuts, cumin and green chilli' },
  // ── Lunch ──
  { id:7,  name:'Dal Khichdi',      cat:'Lunch',     price:80,  cal:350, tags:['HIGH DEMAND','VEGAN'], img: DalKhichdi,   desc:'Comforting rice and lentil one-pot meal with ghee and whole spices' },
  { id:8,  name:'Matar Paneer',     cat:'Lunch',     price:100, cal:420, tags:['HIGH DEMAND'],         img: MatarPaneer,  desc:'Cottage cheese and green peas in a rich, spiced tomato-onion gravy' },
  { id:9,  name:'Bhindi Masala',    cat:'Lunch',     price:90,  cal:310, tags:['VEGAN','LOW CALORIE'], img: BhindiMasala, desc:'Stir-fried okra with onions, tomatoes and aromatic Indian spices' },
  { id:10, name:'Veg Biryani',      cat:'Lunch',     price:120, cal:480, tags:['HIGH DEMAND','VEGAN'], img: VegBiryani,   desc:'Fragrant long-grain basmati rice layered with spiced seasonal vegetables' },
  { id:11, name:'Misal Pav',        cat:'Lunch',     price:70,  cal:390, tags:['HIGH DEMAND'],         img: Misal,        desc:'Spicy sprouted moth bean curry topped with farsan, served with pav' },
  { id:12, name:'Pav Bhaji',        cat:'Lunch',     price:80,  cal:430, tags:['HIGH DEMAND','VEGAN'], img: PavBhaji,     desc:'Spiced mashed vegetable curry served with buttered toasted pav rolls' },
  // ── Snacks ──
  { id:13, name:'Samosa',           cat:'Snacks',    price:30,  cal:180, tags:['HIGH DEMAND','VEGAN'], img: Samosa,       desc:'Golden pastry filled with spiced potatoes and peas, served with chutneys' },
  { id:14, name:'Samosa Chaat',     cat:'Snacks',    price:50,  cal:250, tags:['HIGH DEMAND'],         img: SamosaChaat,  desc:'Crushed samosa topped with yoghurt, chutneys, onions and sev' },
  { id:15, name:'Vada Pav',         cat:'Snacks',    price:35,  cal:290, tags:['HIGH DEMAND','VEGAN'], img: VadaPav,      desc:'Mumbai street-style spiced potato fritter in a soft pav bun with chutney' },
  { id:16, name:'Sandwich',         cat:'Snacks',    price:55,  cal:320, tags:['LOW CALORIE'],         img: Sandwich,     desc:'Toasted bread layered with mint chutney, veggies and melted cheese' },
  { id:17, name:'Schezwan Rice',    cat:'Snacks',    price:90,  cal:410, tags:['HIGH DEMAND'],         img: SchezwanRice, desc:'Indo-Chinese wok-tossed rice with vegetables in fiery schezwan sauce' },
  { id:18, name:'Hakka Noodles',    cat:'Snacks',    price:85,  cal:380, tags:['HIGH DEMAND'],         img: HakkaNoodles, desc:'Stir-fried noodles with crisp vegetables tossed in soy and chilli sauce' },
  { id:19, name:'Fried Rice',       cat:'Snacks',    price:80,  cal:370, tags:['VEGAN'],               img: FriedRice,    desc:'Classic egg-less fried rice with colourful vegetables and soy seasoning' },
]

export const ORDERS_DATA = [
  { id:'QL-1024', name:'Masala Dosa',   desc:'With coconut chutney and sambar',         price:60,  status:'PREPARING', time:'Today, 09:15 AM',     img: MasalaDosa,  student:'Divya Sharma', table:'T-04' },
  { id:'QL-0982', name:'Veg Biryani',   desc:'Fragrant basmati with seasonal veggies',  price:120, status:'READY',     time:'Today, 12:40 PM',     img: VegBiryani,  student:'Arjun Mehta',  table:'T-07' },
  { id:'QL-0814', name:'Pav Bhaji',     desc:'Spiced mash with buttered pav rolls',     price:80,  status:'COMPLETED', time:'Yesterday, 07:22 PM', img: PavBhaji,    student:'Priya Nair',   table:'T-02' },
  { id:'QL-0756', name:'Samosa Chaat',  desc:'With yoghurt, chutneys and sev',          price:50,  status:'PREPARING', time:'Today, 01:10 PM',     img: SamosaChaat, student:'Rohit Gupta',  table:'T-09' },
  { id:'QL-0699', name:'Misal Pav',     desc:'Spicy moth bean curry with pav',          price:70,  status:'READY',     time:'Today, 01:25 PM',     img: Misal,       student:'Sneha Iyer',   table:'T-11' },
]
