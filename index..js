import {useState, useEffect} from "react";
import $$observable from 'symbol-observable'

const useStore = (store)=>{
  const [state, setState] = useState(store.getState())
  useEffect(()=>{
    const observer = store[$$observable]()
    observer.subscribe({
      next: state=>{
        setState(state)
      }
    })
  }, [])  

  return [state, store.dispatch, store.subscribe, store.replaceReducer, store[$$observable]]
}

export default useStore