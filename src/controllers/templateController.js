const templateRepository = require('../database/repositories/templateRepository');

exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await templateRepository.findAll();
    
    res.render('pages/templates', {
      pageTitle: 'Templates',
      path: '/templates',
      templates,
      success: req.query.success || false
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    next(error);
  }
};

exports.getCreateTemplate = (req, res, next) => {
  try {
    res.render('pages/create-template', {
      pageTitle: 'Create Template',
      path: '/templates',
      error: req.query.error || false
    });
  } catch (error) {
    next(error);
  }
};

exports.postCreateTemplate = async (req, res, next) => {
  try {
    const { name, description, channel, subject, content } = req.body;
    
    if (!name || !channel || !content) {
      return res.redirect('/templates/create?error=true');
    }
    
    await templateRepository.create({
      name,
      description,
      channel,
      subject,
      content,
      html_content: content, // TODO Update later.
      variables: [] // TODO Extract variables from content later
    });
    
    res.redirect('/templates?success=true');
  } catch (error) {
    console.error('Error creating template:', error);
    res.redirect('/templates/create?error=true');
  }
};