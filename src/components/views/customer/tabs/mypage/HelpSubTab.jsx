import React from 'react';
import SupportView from '../../../shared/SupportView';

const HelpSubTab = ({ userRole, isLoggedIn, onOpenAuth }) => (
  <SupportView userRole={userRole} isLoggedIn={isLoggedIn} onOpenAuth={onOpenAuth} isEmbedded={true} />
);

export default HelpSubTab;
