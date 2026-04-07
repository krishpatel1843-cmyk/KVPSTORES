export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  category: string
  subCategory: string
  image: string
  images: string[]
  description: string
  sizes?: string[]
  colors?: string[]
  rating: number
  reviews: number
  badge?: string
  inStock: boolean
  tags: string[]
}

export const products: Product[] = [
  // Men
  {
    id: 1,
    name: "Classic Graphic Tee",
    price: 24.99,
    originalPrice: 34.99,
    category: "men",
    subCategory: "t-shirts",
    image: "https://sspark.genspark.ai/cfimages?u1=OrukyFe1EJ%2FDROEV8wncrZDsj54Jl7cSi%2BHkJabufW6fUcsefxikIeO6Un4%2FhOXljmwmnamBg3LMlEIzI1gXCo2%2FFp2p%2FtrBrJ1NxPG8jQ%3D%3D&u2=5eLdRUDRlcLMqPaW&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=OrukyFe1EJ%2FDROEV8wncrZDsj54Jl7cSi%2BHkJabufW6fUcsefxikIeO6Un4%2FhOXljmwmnamBg3LMlEIzI1gXCo2%2FFp2p%2FtrBrJ1NxPG8jQ%3D%3D&u2=5eLdRUDRlcLMqPaW&width=2560",
    ],
    description: "Soft, breathable 100% cotton graphic tee. Perfect for everyday wear with bold prints that make a statement.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Navy", "Gray"],
    rating: 4.7,
    reviews: 142,
    badge: "SALE",
    inStock: true,
    tags: ["graphic", "casual", "cotton"],
  },
  {
    id: 2,
    name: "Premium Pullover Hoodie",
    price: 49.99,
    category: "men",
    subCategory: "hoodies",
    image: "https://sspark.genspark.ai/cfimages?u1=lLOyvMjZ3NaJEzkEIqwaM9DpXoo1x5Ei%2BXoLPffQr30zG3tvAXWVkp1m6U36yXa5E%2F2IwS%2B%2B%2FwVK0ZZgDFbIlxlnuX6u16ThZYsXKns8Tw%3D%3D&u2=BtJE3wUIJ0FQTtFy&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=lLOyvMjZ3NaJEzkEIqwaM9DpXoo1x5Ei%2BXoLPffQr30zG3tvAXWVkp1m6U36yXa5E%2F2IwS%2B%2B%2FwVK0ZZgDFbIlxlnuX6u16ThZYsXKns8Tw%3D%3D&u2=BtJE3wUIJ0FQTtFy&width=2560",
    ],
    description: "Ultra-cozy fleece hoodie with a kangaroo pocket. Durable stitching and vibrant print-ready surface.",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Charcoal", "Forest Green", "Maroon"],
    rating: 4.9,
    reviews: 87,
    badge: "BESTSELLER",
    inStock: true,
    tags: ["hoodie", "warm", "fleece"],
  },
  {
    id: 3,
    name: "Custom Logo Sweatshirt",
    price: 39.99,
    category: "men",
    subCategory: "sweatshirts",
    image: "https://sspark.genspark.ai/cfimages?u1=Cbq81aWVKFX%2BWaKmdnDfTA8rVBfurb4Mplf90DgOut8hcMKDWDds562TgvEg09VV4Ksm6zmuORm2UqpmJNGOaCth%2FlWAiG2e4bQ7Kcr4&u2=ki8JBu7nUNhsXYCO&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=Cbq81aWVKFX%2BWaKmdnDfTA8rVBfurb4Mplf90DgOut8hcMKDWDds562TgvEg09VV4Ksm6zmuORm2UqpmJNGOaCth%2FlWAiG2e4bQ7Kcr4&u2=ki8JBu7nUNhsXYCO&width=2560",
    ],
    description: "Classic crewneck sweatshirt with superior print quality. Comfortable enough for daily wear, stylish enough for any occasion.",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Navy", "Gray Heather"],
    rating: 4.5,
    reviews: 63,
    inStock: true,
    tags: ["sweatshirt", "casual", "logo"],
  },
  {
    id: 4,
    name: "Unisex Graphic Hoodie",
    price: 54.99,
    originalPrice: 69.99,
    category: "men",
    subCategory: "hoodies",
    image: "https://sspark.genspark.ai/cfimages?u1=1VxaAx7kNCqNSEHLM5Zqbsg4OaATZQYtr8b4cnTmycEHEBYMy1rc7z9uIlLIGSxx4E05mgoFnncdWMC%2Buvud%2BOvQssOuOy50PEnBKa447A%3D%3D&u2=jQ%2F%2F7MA0d692EKFd&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=1VxaAx7kNCqNSEHLM5Zqbsg4OaATZQYtr8b4cnTmycEHEBYMy1rc7z9uIlLIGSxx4E05mgoFnncdWMC%2Buvud%2BOvQssOuOy50PEnBKa447A%3D%3D&u2=jQ%2F%2F7MA0d692EKFd&width=2560",
    ],
    description: "Oversized hoodie with unique graphic prints. Double-lined hood and front kangaroo pocket for ultimate comfort.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White", "Tie-Dye"],
    rating: 4.8,
    reviews: 201,
    badge: "SALE",
    inStock: true,
    tags: ["graphic", "unisex", "oversized"],
  },
  // Women
  {
    id: 5,
    name: "Women's Fitted Tee",
    price: 22.99,
    category: "women",
    subCategory: "t-shirts",
    image: "https://sspark.genspark.ai/cfimages?u1=MXKaxoREKFQqzrYKp7hc3zys73JEHn9sKAvFtnby6VUQkYAXw5UsyJk3%2B7Zrk0FVXTArU3OyGt7bzWllvq4%2Bt7%2Bjjn2O2GBJXxLnJJllIjU7%2BDIKgmqYzHq8GC9Am6PNK1PBVdE%3D&u2=0rHpcJfMMzaHf4od&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=MXKaxoREKFQqzrYKp7hc3zys73JEHn9sKAvFtnby6VUQkYAXw5UsyJk3%2B7Zrk0FVXTArU3OyGt7bzWllvq4%2Bt7%2Bjjn2O2GBJXxLnJJllIjU7%2BDIKgmqYzHq8GC9Am6PNK1PBVdE%3D&u2=0rHpcJfMMzaHf4od&width=2560",
    ],
    description: "Flattering fitted cut with soft cotton blend. Features beautiful custom prints that last wash after wash.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pink", "White", "Lavender", "Black"],
    rating: 4.6,
    reviews: 178,
    badge: "NEW",
    inStock: true,
    tags: ["fitted", "women", "casual"],
  },
  {
    id: 6,
    name: "Ladies Pullover Hoodie",
    price: 46.99,
    category: "women",
    subCategory: "hoodies",
    image: "https://sspark.genspark.ai/cfimages?u1=4Q1eDnkXGWy0H3McsvGPqLFRJ3qlspK8Hbutkq51kGQmubk4M02qGmRw4mH2i0cVr8sIrIoSOtGD7umFjXXs3hiOz2O5MMaOPALDzk4inSUtu1Rr%2FHFa%2Bo5L6n%2BEX89yKGQTyhY%3D&u2=inqqXanuMhZ9cA1U&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=4Q1eDnkXGWy0H3McsvGPqLFRJ3qlspK8Hbutkq51kGQmubk4M02qGmRw4mH2i0cVr8sIrIoSOtGD7umFjXXs3hiOz2O5MMaOPALDzk4inSUtu1Rr%2FHFa%2Bo5L6n%2BEX89yKGQTyhY%3D&u2=inqqXanuMhZ9cA1U&width=2560",
    ],
    description: "Cozy and stylish women's hoodie with a relaxed fit. Perfect for lounging or outdoor adventures.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rose", "Cream", "Sky Blue", "Black"],
    rating: 4.8,
    reviews: 95,
    badge: "BESTSELLER",
    inStock: true,
    tags: ["hoodie", "women", "cozy"],
  },
  {
    id: 7,
    name: "Matching Family T-Shirt Set",
    price: 59.99,
    originalPrice: 79.99,
    category: "women",
    subCategory: "t-shirts",
    image: "https://sspark.genspark.ai/cfimages?u1=JKOcJw80hHk7m4vSFoQksUFsuqDm%2F%2FkybC9QbRwBk%2Fp2Tsstd4FvDe4g%2FFfy5v6ValK4nEugpbzJ3ysRL2J%2Bg%2F5OAOTE3gb1DYi%2B5O%2Bzsc1GjKQS8q5QOCOR22r8NV5FP%2FcDa4oRCQ%3D%3D&u2=096ejJxPBKUTNiN1&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=JKOcJw80hHk7m4vSFoQksUFsuqDm%2F%2FkybC9QbRwBk%2Fp2Tsstd4FvDe4g%2FFfy5v6ValK4nEugpbzJ3ysRL2J%2Bg%2F5OAOTE3gb1DYi%2B5O%2Bzsc1GjKQS8q5QOCOR22r8NV5FP%2FcDa4oRCQ%3D%3D&u2=096ejJxPBKUTNiN1&width=2560",
    ],
    description: "Adorable matching set for couples and families. Same design in different sizes so everyone can coordinate.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Light Blue", "Pink"],
    rating: 4.9,
    reviews: 234,
    badge: "SALE",
    inStock: true,
    tags: ["matching", "family", "gift"],
  },
  // Kids
  {
    id: 8,
    name: "Kids Stumble Guys Tee",
    price: 24.50,
    category: "kids",
    subCategory: "t-shirts",
    image: "https://sspark.genspark.ai/cfimages?u1=RJYkvPzeXiFdiyJ344Ak3SOqbqckUapHwft3luOwVay0ijulFB3SvMUJaer0gryuC4phxmPKh4NlIeDCONArrboUNhomEKsFi2yjFEEw&u2=tqiYrTgFyr9X2vTm&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=RJYkvPzeXiFdiyJ344Ak3SOqbqckUapHwft3luOwVay0ijulFB3SvMUJaer0gryuC4phxmPKh4NlIeDCONArrboUNhomEKsFi2yjFEEw&u2=tqiYrTgFyr9X2vTm&width=2560",
    ],
    description: "Fun and colorful kids t-shirt featuring popular game graphics. Soft, safe fabric perfect for active kids.",
    sizes: ["2T", "4T", "6", "8", "10", "12"],
    colors: ["White", "Yellow", "Light Blue"],
    rating: 4.8,
    reviews: 56,
    badge: "NEW",
    inStock: true,
    tags: ["kids", "gaming", "fun"],
  },
  {
    id: 9,
    name: "Youth Graphic Hoodie",
    price: 34.99,
    category: "kids",
    subCategory: "hoodies",
    image: "https://sspark.genspark.ai/cfimages?u1=0WOmsbBKh2JPiSz58sD7%2FDCeftCCsOPq08wZvBLQJs%2BiROf2sHT1J7hZNPCwcqizAfqQzxiGmdcC8Nn5GQuX6kVh7DFuN1HDKPh1Rd6qeQ9nNvMKedg%3D%3D&u2=cH11LzL8m1L%2FXzy8&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=0WOmsbBKh2JPiSz58sD7%2FDCeftCCsOPq08wZvBLQJs%2BiROf2sHT1J7hZNPCwcqizAfqQzxiGmdcC8Nn5GQuX6kVh7DFuN1HDKPh1Rd6qeQ9nNvMKedg%3D%3D&u2=cH11LzL8m1L%2FXzy8&width=2560",
    ],
    description: "Warm and vibrant youth hoodie. Durable print that kids will love to show off to their friends.",
    sizes: ["4", "6", "8", "10", "12", "14"],
    colors: ["Navy", "Black", "Red"],
    rating: 4.7,
    reviews: 41,
    inStock: true,
    tags: ["kids", "hoodie", "youth"],
  },
  // Home & Living
  {
    id: 10,
    name: "Custom Print Coffee Mug",
    price: 14.99,
    originalPrice: 19.99,
    category: "home-living",
    subCategory: "drinkware",
    image: "https://sspark.genspark.ai/cfimages?u1=b4OugpIaZfPAI8bTMRVB71JwNuGc95t8IA0uZre74%2FsHxCNLTzuFpF0rBqmJ8BplHZFohjPCUMKVOT7y3dWyWZ2J64koytoMe5%2BJd4cJlptCejqMZ0yNnwwpum%2FErjpLGEbXqdIo9fVw&u2=W7MQnMYXgtFA%2BVgU&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=b4OugpIaZfPAI8bTMRVB71JwNuGc95t8IA0uZre74%2FsHxCNLTzuFpF0rBqmJ8BplHZFohjPCUMKVOT7y3dWyWZ2J64koytoMe5%2BJd4cJlptCejqMZ0yNnwwpum%2FErjpLGEbXqdIo9fVw&u2=W7MQnMYXgtFA%2BVgU&width=2560",
    ],
    description: "High-quality ceramic mug with vibrant custom printing. Dishwasher safe with durable glaze finish. Perfect gift idea.",
    sizes: ["11oz", "15oz"],
    colors: ["White", "Black"],
    rating: 4.6,
    reviews: 312,
    badge: "SALE",
    inStock: true,
    tags: ["mug", "coffee", "gift", "kitchen"],
  },
  {
    id: 11,
    name: "Latte Mug Set",
    price: 28.99,
    category: "home-living",
    subCategory: "drinkware",
    image: "https://sspark.genspark.ai/cfimages?u1=ipCYreV02YI15ag7DD9HSBzhgxTSCKR0P0hZnzvJ8VWGEf4WT%2BXz3fU35ETvuopOC%2B%2Bf03P3VsUUqSgaKVrSXl15fqYQ3r1N&u2=sfkjUwVEw7l98t3M&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=ipCYreV02YI15ag7DD9HSBzhgxTSCKR0P0hZnzvJ8VWGEf4WT%2BXz3fU35ETvuopOC%2B%2Bf03P3VsUUqSgaKVrSXl15fqYQ3r1N&u2=sfkjUwVEw7l98t3M&width=2560",
    ],
    description: "Stylish latte mug set with unique artwork. Great for coffee enthusiasts who love unique designs.",
    sizes: ["12oz", "17oz"],
    colors: ["White", "Cream"],
    rating: 4.5,
    reviews: 89,
    badge: "NEW",
    inStock: true,
    tags: ["mug", "latte", "set", "gift"],
  },
  {
    id: 12,
    name: "Large Custom Print Mug",
    price: 17.99,
    category: "home-living",
    subCategory: "drinkware",
    image: "https://sspark.genspark.ai/cfimages?u1=LTe95YSf8BJkByYvDkf7Vt32aCwy4DkHtv9zHCNFWSvxYDOi02Fz9hnntTqP88NE1OCazkWdj%2FtPFxOWhcF%2FxMfRyD5tDYqSXz7CdQpsA7y3Gx3TiaUs4J1Co55cEUGIrQSTrQpbcVgR&u2=uysQ2dZ5lYdBN2cq&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=LTe95YSf8BJkByYvDkf7Vt32aCwy4DkHtv9zHCNFWSvxYDOi02Fz9hnntTqP88NE1OCazkWdj%2FtPFxOWhcF%2FxMfRyD5tDYqSXz7CdQpsA7y3Gx3TiaUs4J1Co55cEUGIrQSTrQpbcVgR&u2=uysQ2dZ5lYdBN2cq&width=2560",
    ],
    description: "Large capacity mug with full wrap custom printing. Perfect for those who love a big morning coffee.",
    sizes: ["15oz"],
    colors: ["White", "Black"],
    rating: 4.7,
    reviews: 143,
    inStock: true,
    tags: ["mug", "large", "custom"],
  },
  // Accessories
  {
    id: 13,
    name: "Custom Tote Bag",
    price: 19.99,
    originalPrice: 24.99,
    category: "accessories",
    subCategory: "bags",
    image: "https://sspark.genspark.ai/cfimages?u1=F76yz%2FokzBsf6lpCaitLg24y3Y22o1uQMnTlpMG98cyE8C6nEQySeMjAMuhnsbHj8PX%2B0rSnil8g7jPRxJhc7Wc0oWRLgriWvf%2FEv%2FG6AW%2F2tUAfh4bnPrd35l%2F5goLdqNttEx9jrAqPfyEVMf3THqPJ&u2=lolY9G95vqaY2GZV&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=F76yz%2FokzBsf6lpCaitLg24y3Y22o1uQMnTlpMG98cyE8C6nEQySeMjAMuhnsbHj8PX%2B0rSnil8g7jPRxJhc7Wc0oWRLgriWvf%2FEv%2FG6AW%2F2tUAfh4bnPrd35l%2F5goLdqNttEx9jrAqPfyEVMf3THqPJ&u2=lolY9G95vqaY2GZV&width=2560",
    ],
    description: "Eco-friendly canvas tote bag with high-quality print. Sturdy handles and large capacity for everyday use.",
    colors: ["Natural", "Black", "Navy"],
    rating: 4.4,
    reviews: 76,
    badge: "SALE",
    inStock: true,
    tags: ["tote", "bag", "eco", "accessories"],
  },
  {
    id: 14,
    name: "Personalized Phone Case",
    price: 16.99,
    category: "accessories",
    subCategory: "phone-cases",
    image: "https://sspark.genspark.ai/cfimages?u1=46nqPuI2qAZF37u0l6ocmgk4sOPi0s5LXn39cZvoaHxNDv6phTLBZOWXlHyqC4VRR5gaE1Ek2J3o8fy87OU760qmNb77M6eakiblz%2BPHP%2F%2BVtkkKZqzq99tRD3tyRSwp82m7WEsCgeYp%2FlBuLsZpHrbeQj56R5pQU8w1QtNpTP0jYzyjS5z1dZRcTL8Ea9MXvqWqhPFISCfnOXntOhLOej1GKt2GaMg%3D&u2=RdiprR8cOyNge7PP&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=46nqPuI2qAZF37u0l6ocmgk4sOPi0s5LXn39cZvoaHxNDv6phTLBZOWXlHyqC4VRR5gaE1Ek2J3o8fy87OU760qmNb77M6eakiblz%2BPHP%2F%2BVtkkKZqzq99tRD3tyRSwp82m7WEsCgeYp%2FlBuLsZpHrbeQj56R5pQU8w1QtNpTP0jYzyjS5z1dZRcTL8Ea9MXvqWqhPFISCfnOXntOhLOej1GKt2GaMg%3D&u2=RdiprR8cOyNge7PP&width=2560",
    ],
    description: "Durable custom printed phone case. Available for multiple phone models with slim and tough case options.",
    colors: ["Clear", "Matte Black", "White"],
    rating: 4.3,
    reviews: 189,
    badge: "NEW",
    inStock: true,
    tags: ["phone case", "accessories", "personalized"],
  },
  {
    id: 15,
    name: "Embroidered Cap",
    price: 26.99,
    originalPrice: 32.99,
    category: "accessories",
    subCategory: "hats",
    image: "https://sspark.genspark.ai/cfimages?u1=ShcaCe%2B8IFGcr4r4egzsvRjgCZ9bDFWR3Gfq0JZH%2FWndKFnR0%2BVXFukrw8q%2Ft7exJQfRyRi8IRv%2FuVqypGwrGQRI13OEIvNow8RKSRMearglR%2B2VFL%2Fwe5bDdI4xu73AjSP5qutE6J%2BE46qOF6z3W8pfqiON&u2=QUPxLBsKuYnVg4Vb&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=ShcaCe%2B8IFGcr4r4egzsvRjgCZ9bDFWR3Gfq0JZH%2FWndKFnR0%2BVXFukrw8q%2Ft7exJQfRyRi8IRv%2FuVqypGwrGQRI13OEIvNow8RKSRMearglR%2B2VFL%2Fwe5bDdI4xu73AjSP5qutE6J%2BE46qOF6z3W8pfqiON&u2=QUPxLBsKuYnVg4Vb&width=2560",
    ],
    description: "Structured cap with custom embroidery. Adjustable strap and breathable material for all-day comfort.",
    colors: ["Black", "Navy", "White", "Red"],
    rating: 4.6,
    reviews: 55,
    badge: "SALE",
    inStock: true,
    tags: ["cap", "hat", "embroidered", "accessories"],
  },
  {
    id: 16,
    name: "Custom Sticker Pack",
    price: 9.99,
    category: "accessories",
    subCategory: "stickers",
    image: "https://sspark.genspark.ai/cfimages?u1=40cBsT48MIlHwdhR8IZiph5L%2FkVOB8y6iDxfyLAXCTKZN1iqmVQlLEvUffsaKPUBKVnMgoO2DefqXAn1CkoqWL9doWBdl7F9XMXuF8%3D&u2=n%2FGfpJqmRPlZiG6V&width=2560",
    images: [
      "https://sspark.genspark.ai/cfimages?u1=40cBsT48MIlHwdhR8IZiph5L%2FkVOB8y6iDxfyLAXCTKZN1iqmVQlLEvUffsaKPUBKVnMgoO2DefqXAn1CkoqWL9doWBdl7F9XMXuF8%3D&u2=n%2FGfpJqmRPlZiG6V&width=2560",
    ],
    description: "Premium vinyl stickers with vibrant designs. Waterproof and UV-resistant for long-lasting use on any surface.",
    rating: 4.5,
    reviews: 423,
    badge: "NEW",
    inStock: true,
    tags: ["stickers", "vinyl", "accessories"],
  },
]

export const categories = [
  { id: "all", name: "All Products", icon: "🛍️" },
  { id: "men", name: "Men", icon: "👕" },
  { id: "women", name: "Women", icon: "👗" },
  { id: "kids", name: "Kids", icon: "🧒" },
  { id: "home-living", name: "Home & Living", icon: "🏠" },
  { id: "accessories", name: "Accessories", icon: "🎒" },
]

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products
  return products.filter((p) => p.category === category)
}

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.badge === "BESTSELLER" || p.reviews > 150).slice(0, 8)
}
