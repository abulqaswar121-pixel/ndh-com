
UPDATE public.courses SET tuition_ngn = CASE slug
  WHEN 'certificate-graphic-design' THEN 55000
  WHEN 'certificate-social-media-management' THEN 45000
  WHEN 'certificate-content-writing' THEN 45000
  WHEN 'certificate-basic-web-design' THEN 65000
  WHEN 'certificate-virtual-assistance' THEN 40000
  WHEN 'certificate-ai-tools-mastery' THEN 75000
  WHEN 'certificate-video-editing' THEN 70000
  WHEN 'certificate-digital-photography' THEN 60000
  WHEN 'diploma-digital-marketing' THEN 150000
  WHEN 'diploma-fullstack-web-development' THEN 220000
  WHEN 'diploma-ui-ux-design' THEN 180000
  WHEN 'diploma-video-production-editing' THEN 170000
  WHEN 'diploma-graphic-design-branding' THEN 160000
  WHEN 'diploma-content-creation-copywriting' THEN 140000
  WHEN 'diploma-ecommerce-dropshipping' THEN 150000
  WHEN 'diploma-data-analysis' THEN 200000
  WHEN 'professional-software-engineering' THEN 550000
  WHEN 'professional-digital-business-management' THEN 420000
  WHEN 'professional-cybersecurity' THEN 600000
  WHEN 'professional-full-brand-strategy' THEN 450000
  WHEN 'professional-advanced-web-mobile' THEN 650000
  ELSE tuition_ngn
END
WHERE slug IN (
  'certificate-graphic-design','certificate-social-media-management','certificate-content-writing',
  'certificate-basic-web-design','certificate-virtual-assistance','certificate-ai-tools-mastery',
  'certificate-video-editing','certificate-digital-photography','diploma-digital-marketing',
  'diploma-fullstack-web-development','diploma-ui-ux-design','diploma-video-production-editing',
  'diploma-graphic-design-branding','diploma-content-creation-copywriting','diploma-ecommerce-dropshipping',
  'diploma-data-analysis','professional-software-engineering','professional-digital-business-management',
  'professional-cybersecurity','professional-full-brand-strategy','professional-advanced-web-mobile'
);
