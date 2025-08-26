const templateRepository = require('../database/repositories/templateRepository');
const logger = require('../utils/logger');

exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await templateRepository.findAll();
    logger.info('Templates page accessed', { count: templates.length });
    
    res.render('pages/templates', {
      pageTitle: 'Templates',
      path: '/templates',
      templates,
      success: req.query.success || false
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    next(error);
  }
};

exports.getCreateTemplate = (req, res, next) => {
  try {
    logger.info('Create template page accessed');
    
    res.render('pages/create-template', {
      pageTitle: 'Create Template',
      path: '/templates',
      error: req.query.error || false
    });
  } catch (error) {
    logger.error('Error loading create template page:', error);
    next(error);
  }
};

exports.postCreateTemplate = async (req, res, next) => {
  try {
    const { name, description, channel, subject, content } = req.body;
    
    if (!name || !channel || !content) {
      logger.warn('Template creation validation failed', { name, channel, hasContent: !!content });
      return res.redirect('/templates/create?error=true');
    }
    
    const template = await templateRepository.create({
      name,
      description,
      channel,
      subject,
      content,
      html_content: content, // TODO: Update later
      variables: [] // TODO: Extract variables from content later
    });
    
    logger.info('Template created', { 
      templateId: template.id, 
      name, 
      channel 
    });
    
    res.redirect('/templates?success=true');
  } catch (error) {
    logger.error('Error creating template:', error);
    res.redirect('/templates/create?error=true');
  }
};