import React from "react";
import { useSagaReducer } from "./useSagaReducer";

export const SagaReducerContext = React.createContext

export const createStore = (reducer, init, saga) => [reducer, init, saga];
export const SagaReducerContextProvider = ({ children, store }) => {
  const [state, dispatch] = useSagaReducer(...store);
  return (
    <SagaReducerContext.Provider value={[state, dispatch]}>
      {children}
    </SagaReducerContext.Provider>
  );
};
