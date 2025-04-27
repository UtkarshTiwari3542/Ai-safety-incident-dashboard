// src/main.ts

// Define interfaces
interface Incident {
    id: number;
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    reported_at: string;
  }
  
  type SeverityFilter = 'All' | 'Low' | 'Medium' | 'High';
  type SortOrder = 'newest' | 'oldest';
  
  // Initial mock data
  const initialIncidents: Incident[] = [
    {
      id: 1,
      title: "Biased Recommendation Algorithm",
      description: "Algorithm consistently favored certain demographics in content recommendations, leading to information filter bubbles and potential reinforcement of biases. Our analysis showed statistically significant preference towards content aligned with particular ideological positions, despite diverse user interests.",
      severity: "Medium",
      reported_at: "2025-03-15T10:00:00Z"
    },
    {
      id: 2,
      title: "LLM Hallucination in Critical Info",
      description: "LLM provided incorrect safety procedure information when queried about emergency protocols, potentially endangering users who might follow the incorrect advice. The model confidently described nonexistent emergency procedures that contradicted established safety guidelines for hazardous material handling.",
      severity: "High",
      reported_at: "2025-04-01T14:30:00Z"
    },
    {
      id: 3,
      title: "Minor Data Leak via Chatbot",
      description: "Chatbot inadvertently exposed non-sensitive user metadata in responses, including approximate location and device type information. While not containing personally identifiable information, this leak could potentially aid in user fingerprinting across sessions.",
      severity: "Low",
      reported_at: "2025-03-20T09:15:00Z"
    },
    {
      id: 4,
      title: "Automated Content Moderation Failure",
      description: "AI content moderation system failed to detect harmful content in multiple languages, allowing policy-violating material to remain visible for several hours. The system consistently missed nuanced policy violations in non-English languages, particularly when culturally-specific contexts were involved.",
      severity: "Medium",
      reported_at: "2025-04-10T16:45:00Z"
    }
  ];
  
  // Dashboard class to manage the application state and UI
  class AISafetyDashboard {
    private incidents: Incident[] = [];
    private expandedId: number | null = null;
    private severityFilter: SeverityFilter = 'All';
    private sortOrder: SortOrder = 'newest';
    private isFormVisible: boolean = false;
    
    // DOM elements
    private incidentsList: HTMLElement;
    private severityFilterSelect: HTMLSelectElement;
    private dateSortSelect: HTMLSelectElement;
    private newIncidentForm: HTMLFormElement;
    private formContainer: HTMLElement;
    private toggleFormBtn: HTMLElement;
    private cancelFormBtn: HTMLElement;
    private emptyState: HTMLElement;
    private emptyStateBtn: HTMLElement;
    private incidentsCount: HTMLElement;
    private notification: HTMLElement;
    
    constructor() {
      // Initialize DOM elements
      this.incidentsList = document.getElementById('incidents-list') as HTMLElement;
      this.severityFilterSelect = document.getElementById('severity-filter') as HTMLSelectElement;
      this.dateSortSelect = document.getElementById('date-sort') as HTMLSelectElement;
      this.newIncidentForm = document.getElementById('new-incident-form') as HTMLFormElement;
      this.formContainer = document.getElementById('form-container') as HTMLElement;
      this.toggleFormBtn = document.getElementById('toggle-form-btn') as HTMLElement;
      this.cancelFormBtn = document.getElementById('cancel-form-btn') as HTMLElement;
      this.emptyState = document.getElementById('empty-state') as HTMLElement;
      this.emptyStateBtn = document.getElementById('empty-state-btn') as HTMLElement;
      this.incidentsCount = document.getElementById('incidents-count') as HTMLElement;
      this.notification = document.getElementById('notification') as HTMLElement;
      
      // Load initial data
      this.incidents = [...initialIncidents];
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initial render
      this.renderIncidents();
      this.updateIncidentsCount();
    }
    
    private setupEventListeners(): void {
      // Filter by severity
      this.severityFilterSelect.addEventListener('change', () => {
        this.severityFilter = this.severityFilterSelect.value as SeverityFilter;
        this.renderIncidents();
        this.updateIncidentsCount();
      });
      
      // Sort by date
      this.dateSortSelect.addEventListener('change', () => {
        this.sortOrder = this.dateSortSelect.value as SortOrder;
        this.renderIncidents();
      });
      
      // Toggle form visibility
      this.toggleFormBtn.addEventListener('click', () => {
        this.toggleForm();
      });
      
      // Empty state button
      this.emptyStateBtn.addEventListener('click', () => {
        this.toggleForm();
      });
      
      // Cancel form button
      this.cancelFormBtn.addEventListener('click', () => {
        this.hideForm();
        this.newIncidentForm.reset();
      });
      
      // New incident form submission
      this.newIncidentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.handleFormSubmit()) {
          this.hideForm();
          this.showNotification();
        }
      });
      
      // Delegate click events for incident items
      this.incidentsList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        if (target.classList.contains('view-details-btn') || target.parentElement?.classList.contains('view-details-btn')) {
          const button = target.classList.contains('view-details-btn') ? target : target.parentElement;
          const incidentId = parseInt(button?.getAttribute('data-id') || '0', 10);
          this.toggleIncidentDetails(incidentId);
        }
      });
    }
    
    private toggleForm(): void {
      this.isFormVisible = !this.isFormVisible;
      if (this.isFormVisible) {
        this.formContainer.classList.add('show-form');
        // Focus on the title input
        setTimeout(() => {
          (document.getElementById('title') as HTMLInputElement).focus();
        }, 300);
      } else {
        this.formContainer.classList.remove('show-form');
      }
    }
    
    private hideForm(): void {
      this.isFormVisible = false;
      this.formContainer.classList.remove('show-form');
    }
    
    private updateIncidentsCount(): void {
      const filteredCount = this.getFilteredIncidents().length;
      this.incidentsCount.textContent = `${filteredCount} incident${filteredCount !== 1 ? 's' : ''}`;
    }
    
    private getFilteredIncidents(): Incident[] {
      // Filter incidents
      if (this.severityFilter === 'All') {
        return [...this.incidents];
      } else {
        return this.incidents.filter(incident => incident.severity === this.severityFilter);
      }
    }
    
    private renderIncidents(): void {
      // Get filtered incidents
      let filteredIncidents = this.getFilteredIncidents();
      
      // Sort incidents
      filteredIncidents.sort((a, b) => {
        const dateA = new Date(a.reported_at).getTime();
        const dateB = new Date(b.reported_at).getTime();
        
        return this.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
      
      // Clear current list
      this.incidentsList.innerHTML = '';
      
      // Show empty state if no incidents match filters
      if (filteredIncidents.length === 0) {
        this.emptyState.style.display = 'block';
        this.incidentsList.style.display = 'none';
      } else {
        this.emptyState.style.display = 'none';
        this.incidentsList.style.display = 'block';
        
        // Render each incident
        filteredIncidents.forEach(incident => {
          const incidentElement = this.createIncidentElement(incident);
          this.incidentsList.appendChild(incidentElement);
        });
      }
    }
    
    private createIncidentElement(incident: Incident): HTMLElement {
      const isExpanded = this.expandedId === incident.id;
      const reportedDate = new Date(incident.reported_at);
      
      // Format date for display
      const formattedDate = reportedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      // Create incident item element
      const li = document.createElement('li');
      li.className = `incident-item severity-${incident.severity.toLowerCase()}`;
      li.setAttribute('data-id', incident.id.toString());
      
      // Create header section
      const header = document.createElement('div');
      header.className = 'incident-header';
      
      const title = document.createElement('div');
      title.className = 'incident-title';
      title.textContent = incident.title;
      
      const meta = document.createElement('div');
      meta.className = 'incident-meta';
      
      const severityBadge = document.createElement('span');
      severityBadge.className = `severity-badge severity-${incident.severity.toLowerCase()}`;
      
      // Add icon based on severity
      const severityIcon = document.createElement('i');
      if (incident.severity === 'Low') {
        severityIcon.className = 'fas fa-info-circle';
      } else if (incident.severity === 'Medium') {
        severityIcon.className = 'fas fa-exclamation-circle';
      } else {
        severityIcon.className = 'fas fa-exclamation-triangle';
      }
      
      severityBadge.appendChild(severityIcon);
      severityBadge.appendChild(document.createTextNode(` ${incident.severity}`));
      
      const date = document.createElement('span');
      date.className = 'incident-date';
      const dateIcon = document.createElement('i');
      dateIcon.className = 'far fa-calendar-alt';
      date.appendChild(dateIcon);
      date.appendChild(document.createTextNode(` ${formattedDate}`));
      
      const viewDetailsBtn = document.createElement('button');
      viewDetailsBtn.className = `view-details-btn ${isExpanded ? 'expanded' : ''}`;
      viewDetailsBtn.setAttribute('data-id', incident.id.toString());
      
      const detailsBtnIcon = document.createElement('i');
      detailsBtnIcon.className = `fas fa-chevron-${isExpanded ? 'up' : 'down'}`;
      viewDetailsBtn.appendChild(detailsBtnIcon);
      viewDetailsBtn.appendChild(document.createTextNode(` ${isExpanded ? 'Hide Details' : 'View Details'}`));
      
      meta.appendChild(severityBadge);
      meta.appendChild(date);
      
      const actions = document.createElement('div');
      actions.className = 'incident-actions';
      actions.appendChild(viewDetailsBtn);
      
      header.appendChild(title);
      header.appendChild(meta);
      header.appendChild(actions);
      
      // Create description section
      const description = document.createElement('div');
      description.className = `incident-description ${isExpanded ? 'show-description' : ''}`;
      description.textContent = incident.description;
      
      // Assemble incident item
      li.appendChild(header);
      li.appendChild(description);
      
      return li;
    }
    
    private toggleIncidentDetails(incidentId: number): void {
      if (this.expandedId === incidentId) {
        this.expandedId = null;
      } else {
        this.expandedId = incidentId;
      }
      
      this.renderIncidents();
    }
    
    private handleFormSubmit(): boolean {
      // Get form values
      const titleInput = document.getElementById('title') as HTMLInputElement;
      const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
      const severityRadios = document.getElementsByName('severity');
      
      let selectedSeverity: 'Low' | 'Medium' | 'High' = 'Medium';
      
      // Get selected severity
      for (let i = 0; i < severityRadios.length; i++) {
        const radio = severityRadios[i] as HTMLInputElement;
        if (radio.checked) {
          selectedSeverity = radio.value as 'Low' | 'Medium' | 'High';
          break;
        }
      }
      
      // Form validation
      if (!titleInput.value.trim() || !descriptionInput.value.trim()) {
        return false;
      }
      
      // Create new incident
      const newIncident: Incident = {
        id: this.generateNewId(),
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        severity: selectedSeverity,
        reported_at: new Date().toISOString()
      };
      
      // Add to incidents array
      this.incidents.unshift(newIncident);
      
      // Reset form
      this.newIncidentForm.reset();
      
      // Re-render incidents list
      this.renderIncidents();
      this.updateIncidentsCount();
      
      return true;
    }
    
    private generateNewId(): number {
      // Get the highest current ID and add 1
      if (this.incidents.length === 0) {
        return 1;
      }
      
      const maxId = Math.max(...this.incidents.map(incident => incident.id));
      return maxId + 1;
    }
    
    private showNotification(): void {
      // Show the notification
      this.notification.classList.add('show');
      
      // Hide after 3 seconds
      setTimeout(() => {
        this.notification.classList.remove('show');
      }, 3000);
    }
  }
  
  // Initialize the dashboard when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    new AISafetyDashboard();
  });

