const currentLocale = () => typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en-US' : 'vi-VN';
export const shortAddress=(address?:string|null,left=6,right=4)=>!address?'—':`${address.slice(0,left)}…${address.slice(-right)}`;
export const formatNumber=(value:number|string|null|undefined,digits=0,locale?:string)=>new Intl.NumberFormat(locale||currentLocale(),{maximumFractionDigits:digits}).format(Number(value||0));
export const formatDate=(value?:string|number|Date|null,locale?:string)=>{if(!value)return'—';const date=new Date(value);if(Number.isNaN(date.getTime()))return'—';return new Intl.DateTimeFormat(locale||currentLocale(),{dateStyle:'medium',timeStyle:'short'}).format(date)};
export const salToKg=(amount:number,kgPerSAL=10)=>amount*kgPerSAL;
