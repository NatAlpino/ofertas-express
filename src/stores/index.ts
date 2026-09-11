import { useCartStore } from './cart'
import { useHistoryStore } from './history'
import { useCompletedOffersStore } from './offers'

export const resetAllStores = () => {
  useCartStore.getState().clear()
  useHistoryStore.getState().reset()
  useCompletedOffersStore.getState().reset()
}
