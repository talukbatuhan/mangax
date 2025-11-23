// Bu tanım, TypeScript'e .css ile biten herhangi bir dosyanın bir modül
// olduğunu ve yan etki (side-effect) için güvenle içe aktarılabileceğini söyler.
declare module '*.css' {
  // globals.css gibi yan etki için import edilen dosyalar için bu yeterlidir.
}

// Eğer CSS Modülleri kullanıyorsanız (import styles from './MyComponent.module.css'),
// alttaki tanımı da eklemelisiniz:
// declare module '*.module.css' {
//   const classes: { [key: string]: string };
//   export default classes;
// }