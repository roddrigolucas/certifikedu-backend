export interface IPdiCreateRequest { }

export interface IPdiNodeAbilities {
  habilidade: string;
}

export interface IPdiNodeBooks {
    title: string;
    authorName: string;
    description: string;
}

export interface IPdiStepInfo {
  description: {
    stepObjective: string;
    completeDescriptionOfWhatToDo: string;
  };
  abilities: Array<IPdiNodeAbilities>;
  books: IPdiNodeBooks;
}
