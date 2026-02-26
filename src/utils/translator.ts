export function isHindi(text: string) {
  return /[\u0900-\u097F]/.test(text);
}

export function translateText(text: string) {
  const dictionary: any = {
    cotton: "कॉटन",
    washable: "धोने योग्य",
    delivery: "डिलीवरी",
    size: "साइज़",
    price: "कीमत",
    fabric: "कपड़ा",
    quality: "गुणवत्ता",
    available: "उपलब्ध",
    stock: "स्टॉक",
  };

  // English → Hindi
  if (!isHindi(text)) {
    let result = text.toLowerCase();
    Object.keys(dictionary).forEach((word) => {
      const regex = new RegExp(word, "gi");
      result = result.replace(regex, dictionary[word]);
    });
    return result;
  }

  // Hindi → English (reverse dictionary)
  let reverse: any = {};
  Object.keys(dictionary).forEach((key) => {
    reverse[dictionary[key]] = key;
  });

  let result = text;
  Object.keys(reverse).forEach((word) => {
    const regex = new RegExp(word, "gi");
    result = result.replace(regex, reverse[word]);
  });

  return result;
}
