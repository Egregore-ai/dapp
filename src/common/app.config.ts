export const Brand = {
  Title: {
    Base: 'dapp-AGI',
    Common: (process.env.NODE_ENV === 'development' ? '[DEV] ' : '') + 'dapp-AGI',
  },
  Meta: {
    Description: 'Launch dapp-AGI to unlock the full potential of AI, with precise control over your data and models. Voice interface, AI personas, advanced features, and fun UX.',
    SiteName: 'dapp-AGI | Precision AI for You',
    ThemeColor: '#32383E',
    TwitterSite: '@enricoros',
  },
  URIs: {
    Home: 'https://decentra-mind.com',
    CardImage: 'https://decentra-mind.com/icons/card-dark-1200.png',
    OpenRepo: 'https://github.com',
    OpenProject: 'https://github.com',
    PrivacyPolicy: 'https://decentra-mind.com/privacy',
    TermsOfService: 'https://decentra-mind.com/terms',
  },
  Docs: {
    Public: (docPage: string) => `https://decentra-mind.com/docs/${docPage}`,
  }
} as const;