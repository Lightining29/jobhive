export function generateVCardString(card) {
  const { personal = {}, contact = {}, socials = {} } = card;
  const nameParts = (personal.fullName || 'Contact').trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstName = nameParts.join(' ');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${personal.fullName || 'Contact'}`,
    personal.organization ? `ORG:${personal.organization}${personal.department ? ';' + personal.department : ''}` : '',
    personal.jobTitle ? `TITLE:${personal.jobTitle}` : '',
    contact.email ? `EMAIL;TYPE=INTERNET,WORK:${contact.email}` : '',
    contact.phone ? `TEL;TYPE=CELL,VOICE:${contact.phone}` : '',
    contact.website ? `URL;TYPE=WORK:${contact.website}` : '',
    contact.address ? `ADR;TYPE=WORK:;;${contact.address};;;;` : '',
    personal.bio ? `NOTE:${personal.bio.replace(/\n/g, ' ')}` : '',
    socials.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/${socials.linkedin}` : '',
    socials.github ? `X-SOCIALPROFILE;TYPE=github:https://github.com/${socials.github}` : '',
    socials.twitter ? `X-SOCIALPROFILE;TYPE=twitter:https://twitter.com/${socials.twitter}` : '',
    'END:VCARD'
  ];

  return lines.filter(Boolean).join('\r\n');
}

export function downloadVCardFile(card) {
  const vcardText = generateVCardString(card);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `${(card.personal?.fullName || 'smart_card').toLowerCase().replace(/\s+/g, '_')}.vcf`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
