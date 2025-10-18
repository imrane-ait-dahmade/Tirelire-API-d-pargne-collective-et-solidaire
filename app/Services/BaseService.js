// Classe de base pour tous les services
class BaseService {
  constructor(model) {
    this.model = model;
  }

  // Récupérer tous les documents avec pagination
  async findAll(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
      
      const query = this.model.find(filters);
      
      if (populate) {
        query.populate(populate);
      }
      
      const results = await query
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();
      
      const total = await this.model.countDocuments(filters);
      
      return {
        data: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  // Récupérer un document par ID
  async findById(id, populate = '') {
    try {
      const query = this.model.findById(id);
      
      if (populate) {
        query.populate(populate);
      }
      
      const result = await query.exec();
      
      if (!result) {
        throw new Error('Document non trouvé');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  // Créer un nouveau document
  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }
  }

  // Mettre à jour un document
  async update(id, data) {
    try {
      const document = await this.model.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
      
      if (!document) {
        throw new Error('Document non trouvé');
      }
      
      return document;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  // Supprimer un document
  async delete(id) {
    try {
      const document = await this.model.findByIdAndDelete(id);
      
      if (!document) {
        throw new Error('Document non trouvé');
      }
      
      return document;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  // Recherche avancée
  async findOne(filters, populate = '') {
    try {
      const query = this.model.findOne(filters);
      
      if (populate) {
        query.populate(populate);
      }
      
      return await query.exec();
    } catch (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  }

  // Compter les documents
  async count(filters = {}) {
    try {
      return await this.model.countDocuments(filters);
    } catch (error) {
      throw new Error(`Erreur lors du comptage: ${error.message}`);
    }
  }
}

export default BaseService;


