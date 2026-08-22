/**
 * Helper utility to get high-resolution travel destination images
 * matching place names in real time.
 */
export const getPlaceImageUrl = (placeName = '') => {
  const p = (placeName || '').toLowerCase().trim();

  if (!p) {
    return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
  }

  if (p.includes('manali') || p.includes('solang') || p.includes('rohtang') || p.includes('hadimba') || p.includes('jogini')) {
    return 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800';
  }

  if (p.includes('kasol') || p.includes('parvati') || p.includes('tosh') || p.includes('manikaran')) {
    return 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800';
  }

  if (p.includes('shimla') || p.includes('kullu') || p.includes('kufri') || p.includes('chail')) {
    return 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800';
  }

  if (p.includes('dharamshala') || p.includes('mcleod') || p.includes('dalhousie')) {
    return 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800';
  }

  if (p.includes('goa') || p.includes('panaji') || p.includes('calangute') || p.includes('baga')) {
    return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800';
  }

  if (p.includes('mumbai') || p.includes('marine drive') || p.includes('gateway')) {
    return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800';
  }

  if (p.includes('gujarat') || p.includes('ahmedabad') || p.includes('somnath') || p.includes('rann') || p.includes('dwarka')) {
    return 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800';
  }

  if (p.includes('bangalore') || p.includes('bengaluru') || p.includes('mysore') || p.includes('coorg')) {
    return 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800';
  }

  if (p.includes('delhi') || p.includes('agra') || p.includes('taj mahal') || p.includes('qutub')) {
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800';
  }

  if (p.includes('jaipur') || p.includes('udaipur') || p.includes('jodhpur') || p.includes('rajasthan') || p.includes('pushkar')) {
    return 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800';
  }

  if (p.includes('varanasi') || p.includes('rishikesh') || p.includes('haridwar') || p.includes('kedarnath')) {
    return 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800';
  }

  if (p.includes('paris') || p.includes('eiffel') || p.includes('louvre')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800';
  }

  if (p.includes('tokyo') || p.includes('japan') || p.includes('kyoto') || p.includes('fuji') || p.includes('osaka')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800';
  }

  if (p.includes('york') || p.includes('manhattan') || p.includes('statue')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800';
  }

  if (p.includes('london') || p.includes('big ben') || p.includes('thames')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800';
  }

  if (p.includes('rome') || p.includes('italy') || p.includes('venice') || p.includes('colosseum') || p.includes('florence')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800';
  }

  if (p.includes('barcelona') || p.includes('madrid') || p.includes('spain') || p.includes('sagrada')) {
    return 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800';
  }

  if (p.includes('dubai') || p.includes('burj') || p.includes('uae') || p.includes('abu dhabi')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800';
  }

  if (p.includes('bali') || p.includes('indonesia') || p.includes('ubud')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800';
  }

  if (p.includes('singapore') || p.includes('marina bay')) {
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800';
  }

  if (p.includes('sydney') || p.includes('australia') || p.includes('melbourne')) {
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800';
  }

  if (p.includes('cairo') || p.includes('egypt') || p.includes('pyramid')) {
    return 'https://images.unsplash.com/photo-1572252821128-56f874945417?w=800';
  }

  // General category fallback matching
  if (p.includes('beach') || p.includes('island') || p.includes('coast')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';
  }

  if (p.includes('mountain') || p.includes('hill') || p.includes('snow') || p.includes('valley')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800';
  }

  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
};
