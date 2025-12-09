const fs = require('fs');

const products = [
  {id:'p001',name:'Raymond Formal Shirt',image:'/images/shirt1.png',price:1789},
  {id:'p002',name:'Peter England Casual Shirt',image:'/images/shirt2.png',price:1299},
  {id:'p003',name:'Raymond Formal Pant',image:'/images/pant1.png',price:2499},
  {id:'p004',name:'Allen Solly T-Shirt',image:'/images/tshirt1.png',price:899},
  {id:'p005',name:'Van Heusen Blazer',image:'/images/blazer.png',price:4999},
  {id:'p006',name:'Blackberrys Trousers',image:'/images/trouser.png',price:2199},
  {id:'p007',name:'Louis Philippe Shirt',image:'/images/shirt3.png',price:1899},
  {id:'p008',name:'Park Avenue Suit',image:'/images/suit.png',price:8999},
  {id:'p009',name:'Arrow Jeans',image:'/images/jeans.png',price:1599},
  {id:'p010',name:'Levi Denim Jacket',image:'/images/jacket1.png',price:3499},
  {id:'p011',name:'Nike Polo Shirt',image:'/images/polo.png',price:1199},
  {id:'p012',name:'Adidas Track Pants',image:'/images/track.png',price:1399},
  {id:'p013',name:'Puma Sports Shoes',image:'/images/shoes1.png',price:2999},
  {id:'p014',name:'Reebok Sneakers',image:'/images/sneaker.png',price:2499},
  {id:'p015',name:'Woodland Boots',image:'/images/boots.png',price:3799},
  {id:'p016',name:'Red Tape Loafers',image:'/images/loafer.png',price:1899},
  {id:'p017',name:'US Polo Chinos',image:'/images/chinos.png',price:1699},
  {id:'p018',name:'Tommy Hilfiger Sweater',image:'/images/sweater.png',price:2999},
  {id:'p019',name:'Calvin Klein Belt',image:'/images/belt.png',price:999},
  {id:'p020',name:'Fastrack Watch',image:'/images/watch.png',price:1499},
  {id:'p021',name:'Ray-Ban Sunglasses',image:'/images/sunglass.png',price:4499},
  {id:'p022',name:'Wildcraft Backpack',image:'/images/backpack.png',price:1799},
  {id:'p023',name:'Titan Wallet',image:'/images/wallet.png',price:699},
  {id:'p024',name:'Levis Leather Jacket',image:'/images/jacket2.png',price:5999},
  {id:'p025',name:'Pepe Jeans Shirt',image:'/images/shirt4.png',price:1399},
  {id:'p026',name:'Wrangler Cargo Pants',image:'/images/cargo.png',price:1899},
  {id:'p027',name:'Spykar Denim',image:'/images/denim.png',price:1699},
  {id:'p028',name:'Being Human Hoodie',image:'/images/hoodie.png',price:1999},
  {id:'p029',name:'Flying Machine Shorts',image:'/images/shorts.png',price:899},
  {id:'p030',name:'John Players Kurta',image:'/images/kurta.png',price:1299}
];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const modes = ['Online','Offline'];
const statuses = ['Complete','In Progress','New'];
const stores = ['sk1','sk2','sk3'];
const transactions = [];

for(let i = 1; i <= 300; i++) {
  const userId = String(((i-1) % 150) + 1).padStart(5, '0');
  const prodIdx = (i-1) % 30;
  const month = months[Math.floor((i-1) / 25) % 12];
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const mode = modes[i % 2];
  const status = statuses[i % 3];
  
  const t = {
    id: String(i).padStart(5, '0'),
    userId: userId,
    productId: products[prodIdx].id,
    qty: Math.floor(Math.random() * 3) + 1,
    month: month,
    date: '2025-' + String(months.indexOf(month) + 1).padStart(2, '0') + '-' + day,
    mode: mode,
    amount: products[prodIdx].price,
    orderStatus: status
  };
  
  if(mode === 'Offline') {
    t.storeId = stores[i % 3];
  }
  
  transactions.push(t);
}

const data = JSON.parse(fs.readFileSync('data/admin.json', 'utf8'));
data.products = products;
data.transactions = transactions;
fs.writeFileSync('data/admin.json', JSON.stringify(data, null, 2));

console.log('Updated admin.json with 30 products and 300 transactions');
