import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extension pour ajouter autotable à jsPDF
jsPDF.autoTable = require('jspdf-autotable');

export const generateInvoicePDF = async (invoice, entreprise) => {
  try {
    const doc = new jsPDF();
    
    // Configuration des polices
    doc.setFont('helvetica');
    
    // En-tête
    let yPosition = 20;
    
    // Logo et infos entreprise (à gauche)
    if (entreprise?.nom) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(entreprise.nom, 20, yPosition);
      yPosition += 10;
    }
    
    if (entreprise?.adresse) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const addressLines = entreprise.adresse.split('\n');
      addressLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
    }
    
    if (entreprise?.telephone || entreprise?.email) {
      yPosition += 2;
      if (entreprise?.telephone) {
        doc.text(`Tél: ${entreprise.telephone}`, 20, yPosition);
        yPosition += 5;
      }
      if (entreprise?.email) {
        doc.text(`Email: ${entreprise.email}`, 20, yPosition);
        yPosition += 5;
      }
    }
    
    // Informations facture (à droite)
    yPosition = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 140, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Numéro: ${invoice.numero}`, 140, yPosition);
    yPosition += 7;
    doc.text(`Date: ${formatDateForPDF(invoice.date_emission)}`, 140, yPosition);
    yPosition += 7;
    if (invoice.date_echeance) {
      doc.text(`Échéance: ${formatDateForPDF(invoice.date_echeance)}`, 140, yPosition);
      yPosition += 7;
    }
    doc.text(`Statut: ${formatStatus(invoice.statut)}`, 140, yPosition);
    
    // Informations client
    yPosition += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.client_nom, 20, yPosition);
    yPosition += 6;
    
    if (invoice.client_adresse) {
      const clientAddressLines = invoice.client_adresse.split('\n');
      clientAddressLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
    }
    
    if (invoice.client_email) {
      doc.text(`Email: ${invoice.client_email}`, 20, yPosition);
      yPosition += 5;
    }
    
    if (invoice.client_telephone) {
      doc.text(`Tél: ${invoice.client_telephone}`, 20, yPosition);
      yPosition += 5;
    }
    
    // Tableau des lignes de facture
    yPosition += 15;
    
    const tableData = invoice.lignes?.map(ligne => [
      ligne.description,
      ligne.quantite.toString(),
      formatCurrencyForPDF(ligne.prix_unitaire),
      formatCurrencyForPDF(ligne.total)
    ]) || [];
    
    doc.autoTable({
      head: [['Description', 'Quantité', 'Prix unitaire', 'Total']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [99, 102, 241], // Couleur accent
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Totaux
    yPosition = doc.lastAutoTable.finalY + 15;
    
    // Positionner les totaux à droite
    const totalsX = 140;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sous-total HT:', totalsX, yPosition);
    doc.text(formatCurrencyForPDF(invoice.sous_total), 180, yPosition, { align: 'right' });
    yPosition += 7;
    
    doc.text(`TVA (${invoice.tva_rate}%):`, totalsX, yPosition);
    doc.text(formatCurrencyForPDF(invoice.tva_montant), 180, yPosition, { align: 'right' });
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total TTC:', totalsX, yPosition);
    doc.text(formatCurrencyForPDF(invoice.total_ttc), 180, yPosition, { align: 'right' });
    
    // Notes
    if (invoice.notes) {
      yPosition += 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(invoice.notes, 170);
      noteLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
    }
    
    // Mentions légales
    yPosition = doc.internal.pageSize.height - 30;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('En cas de retard de paiement, une pénalité de trois fois le taux d\'intérêt légal sera appliquée.', 20, yPosition);
    yPosition += 5;
    doc.text('Aucun escompte pour paiement anticipé.', 20, yPosition);
    
    if (entreprise?.iban) {
      yPosition += 5;
      doc.text(`IBAN: ${entreprise.iban}`, 20, yPosition);
    }
    
    // Pied de page
    yPosition = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page 1 sur 1`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
    return doc;
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};

export const generateReportPDF = async (reportData, entreprise, dateRange) => {
  try {
    const doc = new jsPDF();
    
    // Configuration des polices
    doc.setFont('helvetica');
    let yPosition = 20;
    
    // En-tête
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT D\'ACTIVITÉ', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Période du ${formatDateForPDF(dateRange.start)} au ${formatDateForPDF(dateRange.end)}`, 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Informations entreprise
    if (entreprise?.nom) {
      doc.setFontSize(10);
      doc.text(`Entreprise: ${entreprise.nom}`, 20, yPosition);
      yPosition += 7;
    }
    
    // Statistiques générales
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques générales', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total des factures: ${reportData.stats.total_invoices}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Chiffre d\'affaires HT: ${formatCurrencyForPDF(reportData.stats.revenue_ht)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Montant TVA: ${formatCurrencyForPDF(reportData.stats.tva_total)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Chiffre d\'affaires TTC: ${formatCurrencyForPDF(reportData.stats.revenue_ttc)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Factures payées: ${reportData.stats.paid_invoices}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Factures envoyées: ${reportData.stats.sent_invoices}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Brouillons: ${reportData.stats.draft_invoices}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Factures annulées: ${reportData.stats.cancelled_invoices}`, 20, yPosition);
    yPosition += 15;
    
    // Top clients
    if (reportData.topClients && reportData.topClients.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top clients', 20, yPosition);
      yPosition += 10;
      
      const clientData = reportData.topClients.map((client, index) => [
        (index + 1).toString(),
        client.nom,
        client.invoice_count.toString(),
        formatCurrencyForPDF(client.revenue)
      ]);
      
      doc.autoTable({
        head: [['Rang', 'Client', 'Factures', 'CA TTC']],
        body: clientData,
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: 255,
          fontStyle: 'bold'
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
    }
    
    // Tableau détaillé des factures
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des factures', 20, yPosition);
    yPosition += 10;
    
    const invoiceData = reportData.invoices.map(invoice => [
      invoice.numero,
      formatDateForPDF(invoice.date_emission),
      invoice.client_nom,
      formatStatus(invoice.statut),
      formatCurrencyForPDF(invoice.total_ttc)
    ]);
    
    doc.autoTable({
      head: [['Numéro', 'Date', 'Client', 'Statut', 'Total TTC']],
      body: invoiceData,
      startY: yPosition,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold'
      }
    });
    
    // Pied de page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} sur ${totalPages}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    return doc;
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF de rapport:', error);
    throw error;
  }
};

// Fonctions utilitaires
const formatDateForPDF = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrencyForPDF = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const formatStatus = (status) => {
  const statusMap = {
    'brouillon': 'Brouillon',
    'envoyée': 'Envoyée',
    'payée': 'Payée',
    'annulée': 'Annulée',
  };
  return statusMap[status] || status;
};
