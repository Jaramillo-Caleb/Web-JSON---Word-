
export interface JsonData {
  [key: string]: any;
}

export interface DocumentSection {
  title: string;
  content: string | DocumentSection[] | any[];
}

export interface AnalysisResponse {
  formattedHtml: string;
  suggestedTitle: string;
  sections: {
    heading: string;
    body: string;
  }[];
}
