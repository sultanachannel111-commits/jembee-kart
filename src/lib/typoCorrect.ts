export function correctSearch(query: string) {

let text = query.toLowerCase();

const corrections: any = {
blak: "black",
wite: "white",
tshrt: "tshirt",
tshrit: "tshirt",
hudi: "hoodie",
hodie: "hoodie",
jaket: "jacket"
};

Object.keys(corrections).forEach((wrong)=>{

if(text.includes(wrong)){
text = text.replace(wrong, corrections[wrong]);
}

});

return text;

}
