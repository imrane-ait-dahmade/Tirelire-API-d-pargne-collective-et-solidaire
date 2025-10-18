// Contrôleur de base avec gestion d'erreurs
class BaseController {
  // Réponse de succès
  successResponse(res, data, message = 'Succès', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  // Réponse de succès avec pagination
  paginatedResponse(res, data, message = 'Succès') {
    return res.status(200).json({
      success: true,
      message,
      data: data.data,
      pagination: data.pagination
    });
  }

  // Réponse d'erreur
  errorResponse(res, message = 'Une erreur est survenue', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  // Gestion des erreurs de validation
  validationErrorResponse(res, errors) {
    return this.errorResponse(res, 'Erreur de validation', 422, errors);
  }

  // Gestion des erreurs d'autorisation
  unauthorizedResponse(res, message = 'Non autorisé') {
    return this.errorResponse(res, message, 401);
  }

  // Gestion des erreurs de ressource non trouvée
  notFoundResponse(res, message = 'Ressource non trouvée') {
    return this.errorResponse(res, message, 404);
  }

  // Gestion des erreurs de conflit
  conflictResponse(res, message = 'Conflit') {
    return this.errorResponse(res, message, 409);
  }

  // Wrapper pour gestion automatique des erreurs
  async handleRequest(res, serviceMethod, successMessage = 'Opération réussie') {
    try {
      const result = await serviceMethod();
      
      // Si le résultat contient une pagination
      if (result && result.pagination) {
        return this.paginatedResponse(res, result, successMessage);
      }
      
      return this.successResponse(res, result, successMessage);
    } catch (error) {
      console.error('Erreur dans le contrôleur:', error);

      // Gérer différents types d'erreurs
      if (error.message.includes('non trouvé')) {
        return this.notFoundResponse(res, error.message);
      }
      
      if (error.message.includes('autorisé') || error.message.includes('KYC')) {
        return this.unauthorizedResponse(res, error.message);
      }

      if (error.message.includes('existe déjà')) {
        return this.conflictResponse(res, error.message);
      }

      return this.errorResponse(res, error.message);
    }
  }
}

export default BaseController;


