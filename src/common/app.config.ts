export const Brand = {
  Title: {
    Base: 'Egregore',
    Common: (process.env.NODE_ENV === 'development' ? '[DEV] ' : '') + 'Egregore',
  },
  Meta: {
    Description: 'A revolutionary decentralized AI platform that puts you in complete control of your data and AI interactions. Run powerful language models locally on your own hardware or connect securely to a global network of privacy-first AI nodes.',
    SiteName: 'Egregore',
    ThemeColor: '#32383E',
  },
  URIs: {
    Home: 'https://github.com/Egregore-ai',
    CardImage: 'https://github.com/Egregore-ai/icons/',
    OpenRepo: 'https://github.com/Egregore-ai',
    OpenProject: 'https://github.com/Egregore-ai',
    PrivacyPolicy: 'https://github.com/Egregore-ai/docs/privacy',
    TermsOfService: 'https://github.com/Egregore-ai/docs/terms',
  },
  Docs: {
    Public: (docPage: string) => `https://github.com/Egregore-ai/docs/${docPage}`,
  }
} as const;