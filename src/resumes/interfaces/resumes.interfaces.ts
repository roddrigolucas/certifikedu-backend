export interface IResumePdf {
    profileData: {
        name: string;
        email: string;
        phone: string;
        profileImage?: string;
    };
    resume: {
        title: string;
        description: string;
        experiences: {
            title: string;
            company: string;
            startDate: string;
            endDate: string;
            location: string;
            description: string;
        }[];
        educations: {
            institution: string;
            degree: string;
            startDate: string;
            endDate: string;
            location: string;
            description: string;
        }[];
        languages: {
            language: string;
            level: string;
        }[];
    };
}
