const {useState, useEffect} = require("react")
const $$observable = require('symbol-observable')

const useStore = (store)=>{
  const [state, setState] = useState(store.getState())
  useEffect(()=>{
    const observer = store[$$observable]()
    observer.subscribe({
      next: state=>{
        setState(state)
      }
    })

    return ()=>observer.unsubscribe()
  }, [])  

  return [state, store.dispatch, store.subscribe, store.replaceReducer, store[$$observable]]
}

module.exports = useStore