
import {useReducer} from 'react'
import {patchReducerWithSaga} from './saga'

export default (reducer, initState)=>{
  const store = useReducer(reducer, initState)
  console.log('triggerred')
  patchReducerWithSaga(store)
  return store
}