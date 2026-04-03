export const getBasePrice = (item:any)=>{
  return Number(
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
    item?.price ||
    0
  );
};

export const getOfferPrice = (item:any, offers:any)=>{

  const base = getBasePrice(item);

  const productId = item?.productId || item?.id;

  // 🔥 MATCH PRODUCT OR CATEGORY
  const offer = Object.values(offers || {}).find((o:any)=>{

    if(!o.active) return false;

    if(o.type === "product" && o.productId === productId) return true;

    if(o.type === "category" && o.category === item.category) return true;

    return false;
  });

  if(!offer) return base;

  const now = new Date();
  const end = offer.endDate ? new Date(offer.endDate) : null;

  if(end && now > end) return base;

  const final = Math.round(base - (base * offer.discount / 100));

  return final > 0 ? final : base;
};

export const getCartTotal = (items:any[], offers:any)=>{
  return items.reduce((sum,i)=>{
    return sum + getOfferPrice(i,offers)*(i.quantity||1);
  },0);
};
