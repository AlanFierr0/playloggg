export function reviewParts(text:string){return text.split(/(https?:\/\/[^\s<>]+)/g);}
export function hasReviewProse(text:string){return reviewParts(text).some(part=>!/^https?:\/\//.test(part)&&Boolean(part.trim()));}
