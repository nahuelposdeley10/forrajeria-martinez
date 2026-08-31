export const WHATSAPP_NUMBER = '5491130674658'

export const categories = ['todos', 'perros', 'gatos', 'aves', 'higiene', 'accesorios' , 'salud']

export function formatPrice(price) {
  return '$' + Number(price || 0).toLocaleString('es-AR')
}