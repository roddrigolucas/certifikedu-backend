
interface IStep {
  id: string;

}

export interface IPathModules {
  index: number;
  events?: Array<IStep>;
  subjects?: Array<IStep>;
  internships?: Array<IStep>;
  activities?: Array<IStep>;
}
